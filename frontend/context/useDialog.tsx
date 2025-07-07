"use client";

import { createContext, useContext, useState } from "react"; 


export const DialogContext = createContext({
    open: false,
    onOpenChange: (open: boolean) => {},
});


export function useDialog() {
    return useContext(DialogContext);
}

export default function DialogProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    const onOpenChange = (open: boolean) => {
        setOpen(open);
    };

    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
}