"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UnifiedProductForm } from "@/components/products/UnifiedProductForm";
import { ProductFormData } from "@/types/product";

interface ProductCreationModalProps {
  children: React.ReactNode;
  onProductCreated?: (product: ProductFormData) => void;
  storeId?: string;
  vendorId?: string;
  userRole?: "admin" | "vendor" | "customer" | "super_admin";
}

const ProductCreationModal: React.FC<ProductCreationModalProps> = ({
  children,
  onProductCreated,
  storeId,
  vendorId,
  userRole = "admin",
}) => {
  const [open, setOpen] = useState(false);

  const handleProductCreated = (product: ProductFormData) => {
    onProductCreated?.(product);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau produit</DialogTitle>
        </DialogHeader>
        <UnifiedProductForm
          mode="modal"
          userRole={userRole}
          onProductCreated={handleProductCreated}
          onCancel={handleCancel}
          storeId={storeId}
          vendorId={vendorId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductCreationModal;
