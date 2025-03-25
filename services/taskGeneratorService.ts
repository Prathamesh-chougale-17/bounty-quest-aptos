// services/taskGeneratorService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "../lib/clientpromise";
import { ObjectId } from "mongodb";
import TwitterApi from "twitter-api-v2";
// Add Aptos SDK imports
import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
} from "@aptos-labs/ts-sdk";

export interface GeneratedTask {
  title: string;
  description: string;
  category: "blockchain" | "memes" | "nfts";
  requirements: string[];
  evaluationCriteria: string[];
  rewards: {
    usdcAmount: string;
    nftReward?: string;
  };
}

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

export class TaskGeneratorService {
  private static async generateTaskWithAI(): Promise<GeneratedTask> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
    });

    const prompt = `
      Generate a creative Twitter task related to one of these categories: blockchain, memes, or NFTs.
      The task should be engaging, clear, and encourage creative responses.
      Return ONLY a valid JSON object with no additional text, markdown or explanation. It should start with an opening curly brace '{' and end with a closing curly brace '}'.
      The JSON must strictly follow this format:
      {
        "title": "task title",
        "description": "clear task description",
        "category": "one of: blockchain, memes, nfts",
        "requirements": ["list of specific requirements"],
        "evaluationCriteria": ["specific criteria for judging"],
        "rewards": {
          "usdcAmount": "any number from 1 to 1000",
          "nftReward": "optional NFT reward"
        }
      }

      Make the task fun and engaging while maintaining relevance to crypto/web3 culture.
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract JSON from the response - find content between first { and last }
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in the response");
      }

      const jsonText = jsonMatch[0];
      const parsedTask = JSON.parse(jsonText);

      // Validate that the required fields exist
      if (
        !parsedTask.title ||
        !parsedTask.description ||
        !parsedTask.category ||
        !Array.isArray(parsedTask.requirements) ||
        !Array.isArray(parsedTask.evaluationCriteria) ||
        !parsedTask.rewards ||
        !parsedTask.rewards.usdcAmount
      ) {
        throw new Error("Generated task missing required fields");
      }

      return parsedTask;
    } catch (error) {
      console.error("Error generating task:", error);
      // Fallback to a default task in case of failure
      return {
        title: "Default Twitter Challenge",
        description:
          "Create an engaging tweet about the future of blockchain technology",
        category: "blockchain",
        requirements: [
          "Must include at least one relevant hashtag",
          "Keep it under 280 characters",
        ],
        evaluationCriteria: [
          "Creativity",
          "Relevance to blockchain",
          "Engagement potential",
        ],
        rewards: {
          usdcAmount: "100",
          nftReward: "Limited edition Bounty Quest NFT badge",
        },
      };
    }
  }

  private static async GenerateTweetContent(
    task: GeneratedTask,
    taskId: string
  ) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
    });

    // Helper to escape special characters
    const escapeSpecialChars = (str: string) =>
      str.replace(/[\n\r\t]/g, " ").replace(/"/g, '\\"');

    // Sanitize inputs
    const taskDescription = escapeSpecialChars(task.description);
    const taskRequirements = task.requirements
      .map(escapeSpecialChars)
      .join(", ");
    const taskCriteria = task.evaluationCriteria
      .map(escapeSpecialChars)
      .join(", ");

    // Prompt for AI
    const prompt = `
    You are tasked with creating a tweet to promote a specific task on Bounty Quest. 
    Use the details below to craft a creative, engaging, and persuasive tweet:
  
    1. **Task Description**: ${taskDescription}
    2. **Task Requirements**: ${taskRequirements}
    3. **Evaluation Criteria**: ${taskCriteria}
  
    **Goal**: Encourage users to participate in this task. Include the task link in the tweet:
    https://bounty-quest-aptos.vercel.app/tasks/${taskId}
  
    **Format Requirements**:
    - The tweet should have proper formatting with line breaks for readability.
    - Use emojis to make the tweet engaging.
    - Include the task link and relevant hashtags like #BountyQuest, #Blockchain, etc.
    - Keep the tweet within the 280 character limit.
  
    Respond with the text of the tweet only. Do not include any additional text, JSON format, or comments.
    `;

    // Get response
    const result = await model.generateContent(prompt);
    const tweetContent = result.response.text().trim();
    return tweetContent;
  }

  public static async createNewTask(durationHours: number = 4) {
    const task = await this.generateTaskWithAI();

    const client = await clientPromise;
    const db = client.db("tweetcontest");

    const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + durationHours * 60 * 60 * 1000
    );

    const result = await db.collection("tasks").insertOne({
      ...task,
      startTime,
      endTime,
      isActive: true,
      winners: [],
      isWinnerDeclared: false,
      _id: new ObjectId(),
    });
    const tweet = await this.PostTweetofTask(
      task,
      result.insertedId.toString()
    );
    return { taskId: result.insertedId.toString(), tweet };
  }

  public static async getActiveTask() {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    // if task has ended, set isActive to false
    await this.checkTaskStatus();
    return db.collection("tasks").find({ isActive: true }).toArray();
  }

  public static async getAllTask(): Promise<
    {
      _id: ObjectId;
      title: string;
      description: string;
      category: string;
      requirements: string[];
      evaluationCriteria: string[];
      rewards: {
        usdcAmount: string;
        nftReward?: string;
      };
      startTime: Date;
      endTime: Date;
      isActive: boolean;
      winners?: string[];
      isWinnerDeclared: boolean;
    }[]
  > {
    try {
      const client = await clientPromise;
      const db = client.db("tweetcontest");
      const tasks = await db.collection("tasks").find({}).toArray();
      return tasks.map((task) => ({
        _id: task._id,
        title: task.title,
        description: task.description,
        category: task.category,
        requirements: task.requirements,
        evaluationCriteria: task.evaluationCriteria,
        rewards: task.rewards,
        startTime: task.startTime,
        endTime: task.endTime,
        isActive: task.isActive,
        winners: task.winners,
        isWinnerDeclared: task.isWinnerDeclared,
      }));
    } catch (error) {
      console.error("Error getting all tasks:", error);
      return [];
    }
  }

  public static async PostTweetofTask(task: GeneratedTask, taskId: string) {
    try {
      const tweetContent = await this.GenerateTweetContent(task, taskId);

      const tweet = await twitterClient.readWrite.v2.tweet(tweetContent);
      return tweet;
    } catch (error) {
      return error;
    }
  }

  public static async getActiveTaskById(taskId: string) {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    return db
      .collection("tasks")
      .findOne({ _id: new ObjectId(taskId), isActive: true });
  }

  public static async getTaskById(taskId: string) {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    return db.collection("tasks").findOne({ _id: new ObjectId(taskId) });
  }

  public static async setTaskInactive(taskId: string) {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    return db
      .collection("tasks")
      .updateOne({ _id: new ObjectId(taskId) }, { $set: { isActive: false } });
  }

  public static async getPastTasks() {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    return db.collection("tasks").find({ isActive: false }).toArray();
  }

  // Helper method to send Aptos tokens
  private static async sendAptosTokens(
    recipientAddress: string,
    amount: number
  ): Promise<string> {
    try {
      // Initialize Aptos clients
      const config = new AptosConfig({ network: Network.DEVNET });
      const aptos = new Aptos(config);

      // Create owner account from private key
      const ownerPrivateKey = process.env.APTOS_OWNER_PRIVATE_KEY;
      if (!ownerPrivateKey) {
        throw new Error("Missing APTOS_OWNER_PRIVATE_KEY environment variable");
      }
      const privateKey = new Ed25519PrivateKey(ownerPrivateKey);

      const ownerAccount = Account.fromPrivateKey({
        privateKey,
      });

      // Build transaction for token transfer
      const txn = await aptos.transaction.build.simple({
        sender: ownerAccount.accountAddress,
        data: {
          function: "0x1::aptos_account::transfer",
          functionArguments: [recipientAddress, amount * 100000000], // Convert to Octas (10^8 Octas = 1 APT)
        },
      });

      // Sign and submit transaction
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: ownerAccount,
        transaction: txn,
      });

      // Wait for transaction to be confirmed
      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error("Error sending Aptos tokens:", error);
      throw error;
    }
  }

  // Helper method to interact with bounty smart contract
  private static async distributeBountyRewards(
    taskId: string,
    winners: string[]
  ): Promise<string> {
    try {
      const config = new AptosConfig({ network: Network.DEVNET });
      const aptos = new Aptos(config);

      // Create owner account from private key
      const ownerPrivateKey = process.env.APTOS_OWNER_PRIVATE_KEY;
      if (!ownerPrivateKey) {
        throw new Error("Missing APTOS_OWNER_PRIVATE_KEY environment variable");
      }
      const privateKey = new Ed25519PrivateKey(ownerPrivateKey);

      const ownerAccount = Account.fromPrivateKey({
        privateKey,
      });

      const moduleAddress =
        process.env.BOUNTY_CONTRACT_ADDRESS || ownerAccount.accountAddress;

      // First, complete the task with winners
      const completeTxn = await aptos.transaction.build.simple({
        sender: ownerAccount.accountAddress,
        data: {
          function: `${moduleAddress}::task_rewards::complete_task`,
          functionArguments: [taskId, winners],
        },
      });

      const committedTxn1 = await aptos.signAndSubmitTransaction({
        signer: ownerAccount,
        transaction: completeTxn,
      });

      // Wait for transaction to be confirmed
      await aptos.waitForTransaction({
        transactionHash: committedTxn1.hash,
      });

      // Then distribute rewards
      const distributeTxn = await aptos.transaction.build.simple({
        sender: ownerAccount.accountAddress,
        data: {
          function: `${moduleAddress}::task_rewards::distribute_rewards`,
          functionArguments: [taskId],
        },
      });

      const committedTxn2 = await aptos.signAndSubmitTransaction({
        signer: ownerAccount,
        transaction: distributeTxn,
      });

      // Wait for transaction to be confirmed
      const executedTxn = await aptos.waitForTransaction({
        transactionHash: committedTxn2.hash,
      });

      return executedTxn.hash;
    } catch (error) {
      console.error("Error distributing rewards via smart contract:", error);
      throw error;
    }
  }

  public static async setTaskWinner() {
    let updateCount = 0;
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    const tasks = db.collection("tasks");
    const submission = db.collection("submissions");

    // check if the task isActive is false and isWinnerDeclared is false and endTime should be 2 hours before the current time
    const completedTaskinDeclaredTime = await tasks
      .find({
        isActive: false,
        isWinnerDeclared: false,
        endTime: { $lt: new Date(new Date().getTime() - 2 * 60 * 60 * 1000) },
      })
      .toArray();
    // After task is inactive then evaluate the task as submission collection have the task id and submission score. update the top 3 winners in the task collection winner field array
    const taskIds = completedTaskinDeclaredTime.map((task) => task._id);

    for (const taskId of taskIds) {
      // Get task details to retrieve the prize amount
      const taskDetails = await tasks.findOne({ _id: taskId });
      if (
        !taskDetails ||
        !taskDetails.rewards ||
        !taskDetails.rewards.usdcAmount
      ) {
        console.warn(
          `Task ${taskId} has no rewards information, skipping token distribution`
        );
        continue;
      }

      const prizePool = parseFloat(taskDetails.rewards.usdcAmount);

      const submissions = await submission
        .find({ taskId: taskId.toString() })
        .sort({ "scores.overall": -1 })
        .limit(3)
        .toArray();

      // Create winners array for database update
      const winners = submissions.map((submission) => submission.publicKey);

      // Distribution percentages
      const distribution = [0.4, 0.25, 0.15]; // 1st, 2nd, 3rd place

      // Send tokens to winners
      const transactions = [];
      for (let i = 0; i < submissions.length; i++) {
        if (i < distribution.length) {
          // Make sure we don't exceed our distribution array
          const winnerAmount = prizePool * distribution[i];
          try {
            const txHash = await this.sendAptosTokens(
              submissions[i].publicKey,
              winnerAmount
            );
            transactions.push({
              winner: submissions[i].publicKey,
              rank: i + 1,
              amount: winnerAmount,
              txHash,
            });
          } catch (error) {
            console.error(`Failed to send tokens to winner ${i + 1}:`, error);
          }
        }
      }

      // Send remaining 20% to owner account
      const ownerAmount = prizePool * 0.2;
      const ownerAddress = process.env.APTOS_OWNER_ADDRESS;
      if (ownerAddress) {
        try {
          const txHash = await this.sendAptosTokens(ownerAddress, ownerAmount);
          transactions.push({
            winner: "owner",
            amount: ownerAmount,
            txHash,
          });
        } catch (error) {
          console.error("Failed to send tokens to owner:", error);
        }
      }

      try {
        // Use smart contract for distribution if enabled
        if (process.env.USE_SMART_CONTRACT === "true") {
          const txHash = await this.distributeBountyRewards(
            taskId.toString(),
            winners
          );

          const updatedWinner = await tasks.updateOne(
            { _id: taskId },
            {
              $set: {
                winners,
                isWinnerDeclared: true,
                transactionHash: txHash,
              },
            }
          );
          if (updatedWinner) {
            updateCount++;
          }
        } else {
          // Fallback to the current implementation
          const updatedWinner = await tasks.updateOne(
            { _id: taskId },
            {
              $set: {
                winners,
                isWinnerDeclared: true,
                transactions,
              },
            }
          );
          if (updatedWinner) {
            updateCount++;
          }
        }
      } catch (error) {
        console.error(`Failed to set task winner for task ${taskId}:`, error);
      }
    }
    return updateCount;
  }

  // write a method to set the task as inactive if the end time has passed
  public static async checkTaskStatus() {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    const currentTime = new Date();

    return db
      .collection("tasks")
      .updateMany(
        { endTime: { $lt: currentTime } },
        { $set: { isActive: false } }
      );
  }
}
