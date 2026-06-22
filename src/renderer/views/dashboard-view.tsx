// abstract: Compact watcher dashboard toolbar.
// out_of_scope: Electron IPC, save scanning, and upload implementation.

import { Pause, Play, ShieldOff, Upload } from "lucide-react";
import type * as React from "react";
import { SummaryCard } from "../components/summary-card.js";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog.js";
import { Button } from "../components/ui/button.js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip.js";
import type { SatisfactoryAppCommands } from "../hooks/use-satisfactory-app.js";
import type { DashboardViewModel } from "../view-model.js";

type DashboardViewProps = {
  model: DashboardViewModel;
  commands: Pick<
    SatisfactoryAppCommands,
    "disableUploadsAndExit" | "startWatcher" | "stopWatcher" | "uploadLatestSave"
  >;
};

export function DashboardView({ commands, model }: DashboardViewProps) {
  return (
    <main className="min-h-screen w-[300px] border-r border-border bg-background p-4 text-foreground">
      <section className="flex min-h-[calc(100vh-32px)] flex-col gap-3">
        <header>
          <h1 className="text-[22px] font-bold leading-tight tracking-normal">Map watcher</h1>
        </header>

        <TooltipProvider>
          <section aria-label="Watcher commands" className="flex flex-col gap-2">
            {model.showStartButton ? (
              <CommandTooltip description="Scan the save folder and upload new saves automatically.">
                <Button disabled={model.startDisabled} onClick={() => void commands.startWatcher()}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Start watching
                </Button>
              </CommandTooltip>
            ) : null}
            {model.showStopButton ? (
              <CommandTooltip description="Stop automatic monitoring. Manual uploads remain available.">
                <Button disabled={model.stopDisabled} onClick={() => void commands.stopWatcher()}>
                  <Pause className="h-4 w-4" aria-hidden="true" />
                  Pause watching
                </Button>
              </CommandTooltip>
            ) : null}
            <CommandTooltip description="Upload the newest detected save to update the map once.">
              <Button
                disabled={model.uploadDisabled}
                onClick={() => void commands.uploadLatestSave()}
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload latest save
              </Button>
            </CommandTooltip>
            <AlertDialog>
              <CommandTooltip description="Stops future uploads and exits the app. Files already provided to the third-party page cannot be taken back.">
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <ShieldOff className="h-4 w-4" aria-hidden="true" />
                    Disable uploads
                  </Button>
                </AlertDialogTrigger>
              </CommandTooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable uploads and exit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This stops future uploads and exits the app. It cannot take back a save file
                    already provided to the third-party page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void commands.disableUploadsAndExit()}>
                    Disable uploads
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </TooltipProvider>

        <SummaryCard label="Currently opened save" title={model.latestSaveTitle} />

        {model.showIssue ? (
          <Alert role="alert" variant="destructive">
            <span className="block text-xs font-bold uppercase text-destructive">
              Needs attention
            </span>
            <AlertTitle className="mt-2">{model.issueTitle}</AlertTitle>
            {model.issueDetail ? <AlertDescription>{model.issueDetail}</AlertDescription> : null}
          </Alert>
        ) : null}
      </section>
    </main>
  );
}

type CommandTooltipProps = {
  children: React.ReactNode;
  description: string;
};

function CommandTooltip({ children, description }: CommandTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block">{children}</span>
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
}
