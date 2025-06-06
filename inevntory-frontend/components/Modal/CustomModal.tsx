import { Modal, ModalContent, ModalBody, Button, ModalFooter, ModalHeader } from "@heroui/react";
import React from "react";

interface CustomModalInterface {
    isOpen: any,
    onOpenChange: () => void,
    heading: string,
    children: React.ReactNode,
    bottomContent: React.ReactNode
}

export default function CustomModal({ isOpen, onOpenChange, heading, children, bottomContent }: CustomModalInterface) {
    return (
        <Modal
            backdrop="opaque"
            classNames={{
                backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
            }}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <ModalContent>
                <>
                    <ModalHeader className="flex flex-col gap-1">{heading}</ModalHeader>
                    <ModalBody>
                        {children}
                    </ModalBody>
                    <ModalFooter>
                        {bottomContent}
                    </ModalFooter>
                </>
            </ModalContent>
        </Modal>
    )
}