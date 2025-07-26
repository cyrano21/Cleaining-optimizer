"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  ShoppingCart,
  Heart,
  RotateCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { formatPrice, getStatusColor } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Product3DViewer from "@/components/products/Product3DViewer";
import ProductVideoPlayer from "@/components/products/ProductVideoPlayer";
import Product360Viewer from "@/components/products/Product360Viewer";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      fetchProduct(params.id as string);
    }
  }, [params?.id]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        if (data.data.variants && data.data.variants.length > 0) {
          setSelectedVariant(data.data.variants[0].id);
        }
      } else {
        setError("Produit introuvable");
        setProduct(null);
      }
    } catch (error) {
      setError("Erreur lors du chargement du produit. Veuillez réessayer plus tard.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product || !confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        router.push("/products");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">
            {error}
          </h2>
          <Button asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux produits
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return null; // Sécurité, ne devrait pas arriver car error gère le cas
  }

  const currentPrice = product.originalPrice || product.price;
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount ? product.price * (1 - (product.discount || 0) / 100) : product.price;
  const selectedVariantData = product.variants?.find(
    (v) => v.id === selectedVariant,
  );
  const currentStock = selectedVariantData?.stock || product.stock;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {product.title}
              </h1>
              <p className="text-muted-foreground" data-oid="um7ifb2">
                SKU: {product.sku}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2" data-oid="_c9:8zs">
            <Button variant="outline" asChild data-oid="9rarrfy">
              <Link href={`/products/${product.id}/edit`} data-oid="_8p7adx">
                <Edit className="mr-2 h-4 w-4" data-oid="bugpv5y" />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              data-oid="11ypt3f"
            >
              <Trash2 className="mr-2 h-4 w-4" data-oid="5gg0zxf" />
              Delete
            </Button>
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          data-oid="gn.wejl"
        >
          {/* Product Images */}
          <div className="space-y-4" data-oid="0x2lr7c">
            <Card data-oid="ksyq5k1">
              <CardContent className="p-4" data-oid="bpvp4q0">
                <div
                  className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 mb-4"
                  data-oid="99jtf6q"
                >
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[selectedImageIndex]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      data-oid=".v3j_9."
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-gray-400"
                      data-oid="x75teds"
                    >
                      No Image Available
                    </div>
                  )}
                  {hasDiscount && (
                    <Badge
                      className="absolute top-4 left-4"
                      variant="destructive"
                      data-oid="e_50zok"
                    >
                      -
                      {Math.round(product.discount || 0)}
                      %
                    </Badge>
                  )}
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        title={`Voir l'image ${index + 1}`}
                        className={`aspect-square relative overflow-hidden rounded-md border-2 transition-colors ${
                          selectedImageIndex === index
                            ? "border-primary"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="100px"
                          data-oid="tnp31ho"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3D Models */}
            {product.media3D && product.media3D.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>3D Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <Product3DViewer 
                    modelUrl={product.media3D[0].modelUrl}
                    textureUrls={product.media3D[0].textureUrls}
                    type={product.media3D[0].type}
                    previewImage={product.media3D[0].previewImage}
                    animations={product.media3D[0].animations}
                  />
                </CardContent>
              </Card>
            )}

            {/* Videos */}
            {product.videos && product.videos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductVideoPlayer videos={product.videos} />
                </CardContent>
              </Card>
            )}

            {/* 360° Views */}
            {product.views360 && product.views360.length > 0 && (
              <div className="space-y-4">
                {product.views360.map((view360, index) => (
                  <Card key={view360.id || index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RotateCw className="h-5 w-5" />
                        {view360.name || `Vue 360° ${index + 1}`}
                      </CardTitle>
                      {view360.description && (
                        <p className="text-sm text-gray-600">{view360.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Product360Viewer
                        images={view360.images}
                        autoRotate={view360.autoRotate}
                        rotationSpeed={view360.rotationSpeed}
                        zoomEnabled={view360.zoomEnabled}
                        onImageChange={(index) => console.log(`360° view image changed to ${index}`)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6" data-oid="a:1jkj8">
            {/* Basic Info */}
            <Card data-oid=".7f3.gu">
              <CardHeader data-oid="dxw4spi">
                <CardTitle data-oid="qmgihyd">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4" data-oid="-r:2ox6">
                <div className="flex items-center gap-2" data-oid="m1u5n7v">
                  <Badge
                    className={getStatusColor(product.isActive ? 'active' : 'inactive')}
                    data-oid="1prn.0k"
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" data-oid="dg61q3.">
                    {product.category.name}
                  </Badge>
                  {product.isFeatured && (
                    <Badge variant="secondary" data-oid="460r.mg">
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="space-y-2" data-oid=".iy6.vj">
                  <div className="flex items-center gap-2" data-oid="4xy66sv">
                    <span
                      className="text-2xl font-bold text-primary"
                      data-oid="pcl770c"
                    >
                      {formatPrice(currentPrice)}
                    </span>
                    {hasDiscount && (
                      <span
                        className="text-lg text-muted-foreground line-through"
                        data-oid=".fl8teu"
                      >
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {product.rating && (
                    <div className="flex items-center gap-2" data-oid="kqowp7l">
                      <div className="flex items-center" data-oid="kvkhggc">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating!)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                            data-oid="4ucar1o"
                          />
                        ))}
                      </div>
                      <span
                        className="text-sm text-muted-foreground"
                        data-oid="n70f0bn"
                      >
                        {product.rating} ({product.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground" data-oid="pan9jnb">
                  {product.description}
                </p>

                <div
                  className="grid grid-cols-2 gap-4 text-sm"
                  data-oid="77ao.9d"
                >
                  <div data-oid="bcn.omf">
                    <span className="font-medium" data-oid="4m3voi:">
                      Brand:
                    </span>{" "}
                    {product.brand}
                  </div>
                  <div data-oid="4gwtqjj">
                    <span className="font-medium" data-oid="c0vm8:a">
                      Stock:
                    </span>{" "}
                    {currentStock}
                  </div>
                  <div data-oid="bxs6kmr">
                    <span className="font-medium" data-oid="5ntavdf">
                      SKU:
                    </span>{" "}
                    {product.sku}
                  </div>
                  <div data-oid="0tp.4bh">
                    <span className="font-medium" data-oid="izxob:4">
                      Category:
                    </span>{" "}
                    {product.category.name}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <Card data-oid="dagh6o5">
                <CardHeader data-oid="v96ll5l">
                  <CardTitle data-oid="9.g:sby">Variants</CardTitle>
                </CardHeader>
                <CardContent data-oid="l4d:i3c">
                  <div className="space-y-3" data-oid="pk1h2u-">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedVariant === variant.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedVariant(variant.id)}
                        data-oid="kna-wgo"
                      >
                        <div
                          className="flex items-center justify-between"
                          data-oid="vhxoep."
                        >
                          <div data-oid="n:vnx28">
                            <span className="font-medium" data-oid="sg2p-.y">
                              {variant.name}
                            </span>
                            <span
                              className="text-sm text-muted-foreground ml-2"
                              data-oid="r8_noph"
                            >
                              ({variant.value})
                            </span>
                          </div>
                          <div className="text-right" data-oid="_e1g_y9">
                            <div className="font-medium" data-oid="ki09iyd">
                              {formatPrice(variant.price || product.price)}
                            </div>
                            <div
                              className="text-sm text-muted-foreground"
                              data-oid="itpe9dk"
                            >
                              Stock: {variant.stock}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <Card data-oid=".3vmk8a">
                <CardHeader data-oid="ey..e0y">
                  <CardTitle data-oid="6tv9ba8">Specifications</CardTitle>
                </CardHeader>
                <CardContent data-oid="g66gph:">
                  <div className="space-y-2" data-oid="isw1lmi">
                    {product.specifications.map((spec, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 border-b border-gray-100 last:border-b-0"
                        data-oid=":_.6h1k"
                      >
                        <span className="font-medium" data-oid="x0y8wyt">
                          {spec.name}:
                        </span>
                        <span
                          className="text-muted-foreground"
                          data-oid="2ocv-hi"
                        >
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <Card data-oid="a-ld-hh">
                <CardHeader data-oid="1.1wrs5">
                  <CardTitle data-oid="katqqmq">Tags</CardTitle>
                </CardHeader>
                <CardContent data-oid="ye9z4xo">
                  <div className="flex flex-wrap gap-2" data-oid="hxn-dox">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" data-oid="kdxr9gh">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card data-oid="5n0u7b:">
              <CardContent className="p-4" data-oid="kv4rrzp">
                <div className="flex gap-3" data-oid="hij09x3">
                  <Button className="flex-1" data-oid="39jqstv">
                    <ShoppingCart className="mr-2 h-4 w-4" data-oid="adid_-w" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" data-oid="fojlu43">
                    <Heart className="h-4 w-4" data-oid="ok.chfl" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
