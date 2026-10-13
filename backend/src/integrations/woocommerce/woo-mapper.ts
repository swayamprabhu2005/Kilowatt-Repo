import type { ProductDTO, ProductVariantDTO, AttributeDefinitionDTO } from '../../types/index.js';
import type { WooProductPayload, WooVariationPayload, WooAttributeItem } from './woo-types.js';

export class WooMapper {
  /**
   * Transforms internal PIM ProductDTO into WooCommerce v3 REST payload.
   */
  static toWooProductPayload(
    product: ProductDTO,
    attributeDefinitions: AttributeDefinitionDTO[],
    categoryMappings: Array<{ pimId: string; wooCategoryId: number }>
  ): WooProductPayload {
    // 1. Status mapping
    const statusMap: Record<string, 'publish' | 'draft' | 'private'> = {
      published: 'publish',
      draft: 'draft',
      archived: 'private',
    };
    const wooStatus = statusMap[product.status] || 'draft';

    // 2. Categories mapping
    const wooCatIds = product.categoryIds
      .map((catId) => categoryMappings.find((m) => m.pimId === catId)?.wooCategoryId)
      .filter((id): id is number => typeof id === 'number')
      .map((id) => ({ id }));

    // 3. Images mapping
    const images = (product.images || []).map((img) => ({
      src: img.url,
      alt: img.alt || product.name,
    }));

    // 4. Attributes mapping
    const attributes: WooAttributeItem[] = [];
    const defMap = new Map(attributeDefinitions.map((d) => [d.code, d]));

    for (const [code, val] of Object.entries(product.attributes || {})) {
      if (val === undefined || val === null || val === '') continue;
      const def = defMap.get(code);
      const name = def ? def.name : code;
      const options = Array.isArray(val) ? val.map(String) : [String(val)];

      attributes.push({
        name,
        visible: true,
        variation: def ? def.isVariantParam : false,
        options,
      });
    }

    return {
      name: product.name,
      type: product.productType,
      status: wooStatus,
      sku: product.sku,
      regular_price: product.price !== undefined && product.price !== null ? product.price.toFixed(2) : undefined,
      description: product.description || '',
      short_description: product.shortDescription || '',
      categories: wooCatIds.length > 0 ? wooCatIds : undefined,
      images: images.length > 0 ? images : undefined,
      attributes: attributes.length > 0 ? attributes : undefined,
      manage_stock: product.stockQuantity !== null && product.stockQuantity !== undefined,
      stock_quantity: product.stockQuantity ?? undefined,
    };
  }

  /**
   * Transforms internal PIM ProductVariantDTO into WooCommerce variation payload.
   */
  static toWooVariationPayload(
    variant: ProductVariantDTO,
    attributeDefinitions: AttributeDefinitionDTO[]
  ): WooVariationPayload {
    const defMap = new Map(attributeDefinitions.map((d) => [d.code, d]));
    const attrItems = Object.entries(variant.attributeCombination || {}).map(([code, val]) => {
      const def = defMap.get(code);
      return {
        name: def ? def.name : code,
        option: String(val),
      };
    });

    return {
      sku: variant.sku,
      regular_price: variant.priceOverride !== undefined && variant.priceOverride !== null ? variant.priceOverride.toFixed(2) : undefined,
      manage_stock: variant.stockQuantity !== null && variant.stockQuantity !== undefined,
      stock_quantity: variant.stockQuantity ?? undefined,
      attributes: attrItems,
    };
  }
}
