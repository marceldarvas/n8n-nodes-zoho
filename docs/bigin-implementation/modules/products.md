# Products Module

> Product catalog management in Zoho Bigin

## 📋 Overview

Products represent items or services your company sells. Products can be associated with Pipelines and used for pricing calculations.

**API Module Name**: `Products`
**Priority**: Medium
**Estimated Effort**: 2-3 hours

## 🔧 API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List | GET | `/Products` |
| Get | GET | `/Products/{id}` |
| Create | POST | `/Products` |
| Update | PUT | `/Products` |
| Delete | DELETE | `/Products/{id}` |

## 📝 Key Fields

| Display Name | API Field Name | Type | Required |
|--------------|----------------|------|----------|
| Product Name | `Product_Name` | string | **Yes** |
| Product Code | `Product_Code` | string | No |
| Unit Price | `Unit_Price` | currency | No |
| Active | `Product_Active` | boolean | No |
| Taxable | `Taxable` | boolean | No |
| Tax | `Tax` | string/percent | No |
| Manufacturer | `Manufacturer` | string | No |
| Product Category | `Product_Category` | string | No |
| Qty in Stock | `Qty_in_Stock` | number | No |
| Description | `Description` | textarea | No |
| Owner | `Owner` | lookup | Auto |

## 📥 Create Product Example

```json
{
    "data": [
        {
            "Product_Name": "Enterprise License - Annual",
            "Product_Code": "ENT-LIC-001",
            "Unit_Price": 9999.99,
            "Product_Active": true,
            "Taxable": true,
            "Tax": "10.00",
            "Product_Category": "Software",
            "Qty_in_Stock": 100,
            "Description": "Annual enterprise license for up to 100 users"
        }
    ]
}
```

## 🔍 Common Filters

- `Product_Active` - true/false
- `Product_Category` - filter by category
- `Unit_Price` - price range

## ✅ Testing Checklist

- [ ] Create product (name only)
- [ ] Create with pricing
- [ ] Toggle active/inactive status
- [ ] Update unit price
- [ ] Delete product

---

## 📚 Related Resources

### Bigin API v2 Documentation
- **Get Records API**: https://www.bigin.com/developer/docs/apis/v2/get-records.html - Retrieve product records
- **Insert Records API**: https://www.bigin.com/developer/docs/apis/v2/insert-records.html - Create new products
- **Update Records API**: https://www.bigin.com/developer/docs/apis/v2/update-records.html - Update product data
- **Delete Records API**: https://www.bigin.com/developer/docs/apis/v2/delete-records.html - Delete products
- **Search Records API**: https://www.bigin.com/developer/docs/apis/v2/search-records.html - Advanced product search
- **Field Meta Data API**: https://www.bigin.com/developer/docs/apis/v2/field-meta.html - Get field definitions

---

**Status**: 📝 Ready for Implementation
