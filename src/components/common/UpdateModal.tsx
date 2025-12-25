import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Info } from 'lucide-react';

interface UpdateModalProps {
    open: boolean;
    version: string;
    releaseNotes?: string;
    onUpdate: () => void;
    forceUpdate?: boolean;
    onCancel?: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
    open,
    version,
    releaseNotes,
    onUpdate,
    forceUpdate = false,
    onCancel,
}) => {
    return (
        <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && !forceUpdate && onCancel?.()}>
            <AlertDialogContent className="max-w-xs sm:max-w-md rounded-xl">
                <AlertDialogHeader>
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Download className="w-6 h-6 text-primary" />
                    </div>
                    <AlertDialogTitle className="text-center text-xl">New Update Available!</AlertDialogTitle>
                    <AlertDialogDescription className="text-center space-y-2">
                        <span className="block font-medium text-foreground">Version {version} is now available.</span>
                        {releaseNotes && (
                            <div className="bg-muted/50 p-3 rounded-lg text-sm text-left mt-2 max-h-[150px] overflow-y-auto">
                                <div className="flex items-center gap-2 mb-1 text-primary font-semibold text-xs uppercase tracking-wider">
                                    <Info className="w-3 h-3" />
                                    What's New
                                </div>
                                {releaseNotes}
                            </div>
                        )}
                        <span className="block pt-2">Please update to continue using the app with the latest features and fixes.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center flex-col sm:flex-row gap-2">
                    {!forceUpdate && onCancel && (
                        <button
                            onClick={onCancel}
                            className="mt-2 sm:mt-0 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Later
                        </button>
                    )}
                    <AlertDialogAction
                        onClick={onUpdate}
                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Update Now
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
