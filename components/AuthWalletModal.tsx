"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";
import { useEffect } from "react";
import { Button } from "./ui/button";
import {
  AboutAptosConnect,
  AboutAptosConnectEducationScreen,
  AdapterNotDetectedWallet,
  AdapterWallet,
  AptosPrivacyPolicy,
  WalletItem,
  WalletSortingOptions,
  groupAndSortWallets,
  isInstallRequired,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export function WalletModal(walletSortingOptions: WalletSortingOptions = {}) {
  const { connected } = useWallet();

  useEffect(() => {
    const mainContent = document.querySelector("main");
    if (!connected && mainContent) {
      mainContent.classList.add("blur-sm");
    } else if (mainContent) {
      mainContent.classList.remove("blur-sm");
    }
  }, [connected]);

  return (
    <AlertDialog open={!connected}>
      <AlertDialogContent className="max-h-screen overflow-auto max-w-md">
        <ConnectWalletContent {...walletSortingOptions} />
      </AlertDialogContent>
      <AlertDialogOverlay className="bg-background/80 backdrop-blur-sm" />
    </AlertDialog>
  );
}

function ConnectWalletContent(walletSortingOptions: WalletSortingOptions) {
  const { wallets = [], notDetectedWallets = [] } = useWallet();

  const { aptosConnectWallets, availableWallets, installableWallets } =
    groupAndSortWallets(
      [...wallets, ...notDetectedWallets],
      walletSortingOptions
    );

  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  return (
    <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex flex-col text-center leading-snug">
          {hasAptosConnectWallets ? (
            <>
              <span>Connect a wallet to continue</span>
              <span>with Social + Aptos Connect</span>
            </>
          ) : (
            "Connect a wallet to continue"
          )}
        </AlertDialogTitle>
      </AlertDialogHeader>

      {hasAptosConnectWallets && (
        <div className="flex flex-col gap-2 pt-3">
          {aptosConnectWallets.map((wallet) => (
            <AptosConnectWalletRow key={wallet.name} wallet={wallet} />
          ))}
          <p className="flex gap-1 justify-center items-center text-muted-foreground text-sm">
            Learn more about{" "}
            <AboutAptosConnect.Trigger className="flex gap-1 py-3 items-center text-foreground">
              Aptos Connect <ArrowRight size={16} />
            </AboutAptosConnect.Trigger>
          </p>
          <AptosPrivacyPolicy className="flex flex-col items-center py-1">
            <p className="text-xs leading-5">
              <AptosPrivacyPolicy.Disclaimer />{" "}
              <AptosPrivacyPolicy.Link className="text-muted-foreground underline underline-offset-4" />
              <span className="text-muted-foreground">.</span>
            </p>
            <AptosPrivacyPolicy.PoweredBy className="flex gap-1.5 items-center text-xs leading-5 text-muted-foreground" />
          </AptosPrivacyPolicy>
          <div className="flex items-center gap-3 pt-4 text-muted-foreground">
            <div className="h-px w-full bg-secondary" />
            Or
            <div className="h-px w-full bg-secondary" />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-3">
        {availableWallets.map((wallet) => (
          <WalletRow key={wallet.name} wallet={wallet} />
        ))}
        {!!installableWallets.length && (
          <Collapsible className="flex flex-col gap-3">
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-2">
                More wallets <ChevronDown />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-3">
              {installableWallets.map((wallet) => (
                <WalletRow key={wallet.name} wallet={wallet} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      <Button
        variant="outline"
        onClick={() => (window.location.href = "/")}
        className="mt-4"
      >
        Return to Home
      </Button>
    </AboutAptosConnect>
  );
}

interface WalletRowProps {
  wallet: AdapterWallet | AdapterNotDetectedWallet;
  onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem
      wallet={wallet}
      onConnect={onConnect}
      className="flex items-center justify-between px-4 py-3 gap-4 border rounded-md"
    >
      <div className="flex items-center gap-4">
        <WalletItem.Icon className="h-6 w-6" />
        <WalletItem.Name className="text-base font-normal" />
      </div>
      {isInstallRequired(wallet) ? (
        <Button size="sm" variant="ghost" asChild>
          <WalletItem.InstallLink />
        </Button>
      ) : (
        <WalletItem.ConnectButton asChild>
          <Button size="sm">Connect</Button>
        </WalletItem.ConnectButton>
      )}
    </WalletItem>
  );
}

function AptosConnectWalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect}>
      <WalletItem.ConnectButton asChild>
        <Button size="lg" variant="outline" className="w-full gap-4">
          <WalletItem.Icon className="h-5 w-5" />
          <WalletItem.Name className="text-base font-normal" />
        </Button>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}

function renderEducationScreen(screen: AboutAptosConnectEducationScreen) {
  return (
    <>
      <AlertDialogHeader className="grid grid-cols-[1fr_4fr_1fr] items-center space-y-0">
        <Button variant="ghost" size="icon" onClick={screen.cancel}>
          <ArrowLeft />
        </Button>
        <AlertDialogTitle className="leading-snug text-base text-center">
          About Aptos Connect
        </AlertDialogTitle>
      </AlertDialogHeader>

      <div className="flex h-[162px] pb-3 items-end justify-center">
        <screen.Graphic />
      </div>
      <div className="flex flex-col gap-2 text-center pb-4">
        <screen.Title className="text-xl" />
        <screen.Description className="text-sm text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a]:text-foreground" />
      </div>

      <div className="grid grid-cols-3 items-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={screen.back}
          className="justify-self-start"
        >
          Back
        </Button>
        <div className="flex items-center gap-2 place-self-center">
          {screen.screenIndicators.map((ScreenIndicator, i) => (
            <ScreenIndicator key={i} className="py-4">
              <div className="h-0.5 w-6 transition-colors bg-muted [[data-active]>&]:bg-foreground" />
            </ScreenIndicator>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={screen.next}
          className="gap-2 justify-self-end"
        >
          {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
          <ArrowRight size={16} />
        </Button>
      </div>
    </>
  );
}
