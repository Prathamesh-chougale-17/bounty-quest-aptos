"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Task } from "@/types/challenge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, Clock } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const twitterSubmissionSchema = z.object({
  tweetUrl: z
    .string()
    .min(1, "Tweet URL is required")
    .regex(
      /^https?:\/\/x\.com\/\w+\/status\/\d+/,
      "Please enter a valid Twitter URL"
    ),
});

interface SubmissionResult {
  relevanceScore: number;
  engagementScore: number;
  contentQuality: number;
  overallScore: number;
  feedback: string;
}

interface Props {
  task: Task;
}

type FormValues = z.infer<typeof twitterSubmissionSchema>;

export default function TwitterSubmissionForm({ task }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(twitterSubmissionSchema),
  });
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState("");
  const { account } = useWallet();

  const onSubmit = async (data: FormValues) => {
    setError("");

    try {
      const tweetResponse = await fetch("/api/tweet/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.tweetUrl,
          taskData: task,
          publicKey: account?.address.toString(),
        }),
      });

      const res = await tweetResponse.json();

      if (!tweetResponse.ok) {
        // Handle rate limiting specifically

        // Better error handling for various response formats
        if (typeof res.error === "object") {
          throw new Error(res.error.message || JSON.stringify(res.error));
        }

        throw new Error(res.error || `Error: ${tweetResponse.status}`);
      }

      setResult(res.result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6 dark:bg-gray-800 dark:border-gray-700">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-gray-200">
            Submit your Tweet URL
          </label>
          <Input
            {...register("tweetUrl")}
            type="url"
            placeholder="https://x.com/user/status/123..."
            className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
          />
          {errors.tweetUrl && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.tweetUrl.message}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            "Submit Tweet"
          )}
        </Button>
      </form>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-800">
          <Clock className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Twitter API Rate Limit Reached</p>
            <p className="text-sm mt-1">
              We&apos;re currently processing too many requests. Please try
              again in a few minutes.
            </p>
          </div>
        </div>
      )}

      {/* {error && !isRateLimited && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )} */}

      {result && (
        <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/30 rounded">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <h3 className="font-medium">Submission Results</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium dark:text-gray-200">
                Relevance Score
              </p>
              <p className="text-2xl dark:text-gray-100">
                {result.relevanceScore}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium dark:text-gray-200">
                Engagement Score
              </p>
              <p className="text-2xl dark:text-gray-100">
                {result.engagementScore}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium dark:text-gray-200">
                Content Quality
              </p>
              <p className="text-2xl dark:text-gray-100">
                {result.contentQuality}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium dark:text-gray-200">
                Overall Score
              </p>
              <p className="text-2xl dark:text-gray-100">
                {result.overallScore}%
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded">
            <p className="text-sm font-medium dark:text-gray-200">Feedback</p>
            <p className="text-gray-600 dark:text-gray-300">
              {result.feedback}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
