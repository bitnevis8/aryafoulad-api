const BaseController = require('../../core/baseController');
const Invoice = require('./model/Invoice');
const AccountingSettings = require('./model/AccountingSettings');
const User = require('../user/user/model');
const CustomerCompany = require('../user/customerCompany/model');
const Service = require('./model/Service');
const BankAccount = require('./model/BankAccount');
const { Op } = require('sequelize');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun, ImageRun, HeadingLevel, BorderStyle, PageOrientation } = require('docx');
const fs = require('fs');
const path = require('path');

class AccountingController extends BaseController {
  async getSettings(req, res) {
    try {
      let settings = await AccountingSettings.findOne();
      if (!settings) settings = await AccountingSettings.create({});
      return this.response(res, 200, true, 'تنظیمات حسابداری', settings);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در دریافت تنظیمات', null, err.message);
    }
  }

  // Services CRUD
  async servicesGetAll(req, res) {
    try {
      const services = await Service.findAll({ 
        include: [{ 
          model: User, 
          as: 'responsible', 
          attributes: ['id','firstName','lastName','username','email'] 
        }], 
        order: [['row_no','ASC']] 
      });
      return this.response(res, 200, true, 'لیست خدمات', services);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در دریافت خدمات', null, err.message);
    }
  }

  async servicesCreate(req, res) {
    try {
      const { row_no, code, name, description, responsible_user_id } = req.body || {};
      const created = await Service.create({ row_no, code, name, description, responsible_user_id: responsible_user_id || null });
      return this.response(res, 201, true, 'ثبت شد', created);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در ایجاد خدمت', null, err.message);
    }
  }

  async servicesUpdate(req, res) {
    try {
      const { id } = req.params;
      const svc = await Service.findByPk(id);
      if (!svc) return this.response(res, 404, false, 'یافت نشد');
      const { row_no, code, name, description, responsible_user_id } = req.body || {};
      await svc.update({ row_no, code, name, description, responsible_user_id: responsible_user_id || null });
      return this.response(res, 200, true, 'به‌روزرسانی شد', svc);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در به‌روزرسانی', null, err.message);
    }
  }

  async servicesDelete(req, res) {
    try {
      const { id } = req.params;
      const svc = await Service.findByPk(id);
      if (!svc) return this.response(res, 404, false, 'یافت نشد');
      await svc.destroy();
      return this.response(res, 200, true, 'حذف شد');
    } catch (err) {
      return this.response(res, 500, false, 'خطا در حذف', null, err.message);
    }
  }

  async updateSettings(req, res) {
    try {
      let settings = await AccountingSettings.findOne();
      if (!settings) settings = await AccountingSettings.create({});
      await settings.update(req.body || {});
      return this.response(res, 200, true, 'تنظیمات بروزرسانی شد', settings);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در بروزرسانی تنظیمات', null, err.message);
    }
  }

  // Bank Accounts CRUD
  async bankAccountsGetAll(req, res) {
    try {
      const rows = await BankAccount.findAll({ order: [['id','ASC']] });
      return this.response(res, 200, true, 'لیست حساب‌ها', rows);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در دریافت حساب‌ها', null, err.message);
    }
  }

  async bankAccountsGetOne(req, res) {
    try {
      const { id } = req.params;
      const account = await BankAccount.findByPk(id);
      if (!account) return this.response(res, 404, false, 'یافت نشد');
      return this.response(res, 200, true, 'جزئیات حساب', account);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در دریافت حساب', null, err.message);
    }
  }

  async bankAccountsCreate(req, res) {
    try {
      const { bank_name, bank_code, account_number, iban, holder_name, is_active } = req.body || {};
      const created = await BankAccount.create({ bank_name, bank_code, account_number, iban, holder_name, is_active: is_active !== false });
      return this.response(res, 201, true, 'ثبت شد', created);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در ایجاد حساب', null, err.message);
    }
  }

  async bankAccountsUpdate(req, res) {
    try {
      const { id } = req.params;
      const acc = await BankAccount.findByPk(id);
      if (!acc) return this.response(res, 404, false, 'یافت نشد');
      const { bank_name, bank_code, account_number, iban, holder_name, is_active } = req.body || {};
      await acc.update({ bank_name, bank_code, account_number, iban, holder_name, is_active });
      return this.response(res, 200, true, 'به‌روزرسانی شد', acc);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در به‌روزرسانی حساب', null, err.message);
    }
  }

  async bankAccountsDelete(req, res) {
    try {
      const { id } = req.params;
      const acc = await BankAccount.findByPk(id);
      if (!acc) return this.response(res, 404, false, 'یافت نشد');
      await acc.destroy();
      return this.response(res, 200, true, 'حذف شد');
    } catch (err) {
      return this.response(res, 500, false, 'خطا در حذف حساب', null, err.message);
    }
  }

  async getAllInvoices(req, res) {
    try {
      const { type } = req.query;
      const where = {};
      if (type) where.type = type;
      const invoices = await Invoice.findAll({ where, order: [['id', 'DESC']] });
      return this.response(res, 200, true, 'لیست فاکتورها', invoices);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در دریافت فهرست', null, err.message);
    }
  }

  async generateNextNumber(type, customerId, customerCompanyId) {
    const settings = await AccountingSettings.findOne();
    // Determine prefix: use configured prefix; if empty, use current 2-digit year
    let prefix = settings?.file_number_prefix;
    if (!prefix) {
      const now = new Date();
      prefix = (now.getFullYear() % 100).toString().padStart(2, '0');
    }
    const customerPart = settings?.file_number_include_customer_id ? (customerId || customerCompanyId || '0') : '';
    const nextIndex = (settings?.file_number_last_index || 0) + 1;
    if (settings) await settings.update({ file_number_last_index: nextIndex });
    return [prefix, customerPart, nextIndex].filter(Boolean).join('-');
  }

  async createInvoice(req, res) {
    try {
      const { 
        type = 'proforma', 
        customer_id, 
        customer_company_id, 
        file_number, 
        invoice_date, 
        buyer_fields,
        items = [],
        travel_cost = 0,
        tax_percent = 0,
        duties_percent = 0,
        description = '',
        selected_account_id = null
      } = req.body || {};
      
      const number = await this.generateNextNumber(type, customer_id, customer_company_id);

      let buyerData = buyer_fields || {};
      if ((customer_id || customer_company_id) && !buyer_fields) {
        // hydrate buyer from user/company
        if (customer_company_id) {
          const company = await CustomerCompany.findByPk(customer_company_id);
          if (company) {
            buyerData = {
              buyer_legal_name: company.companyName,
              buyer_address: company.address,
              buyer_province: company.province,
              buyer_city: company.city,
              buyer_phone: company.phone,
              buyer_fax: company.fax,
              buyer_postal_code: company.postalCode,
              buyer_registration_number: company.registrationNumber,
              buyer_national_identifier: company.nationalId,
              buyer_economic_code: company.economicCode,
            };
          }
        } else if (customer_id) {
          const user = await User.findByPk(customer_id);
          if (user) {
            buyerData = {
              buyer_legal_name: user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              buyer_phone: user.phone || user.mobile,
              buyer_fax: user.fax,
              buyer_address: user.address,
              buyer_province: user.province,
              buyer_city: user.city,
              buyer_postal_code: user.postalCode,
              buyer_registration_number: user.registrationNumber,
              buyer_national_identifier: user.nationalId,
              buyer_economic_code: user.economicCode,
            };
          }
        }
      }

      const created = await Invoice.create({
        type,
        number,
        file_number,
        invoice_date: invoice_date || new Date(),
        customer_id: customer_id || null,
        customer_company_id: customer_company_id || null,
        items: items.length > 0 ? items : null,
        travel_cost: Number(travel_cost) || 0,
        tax_percent: Number(tax_percent) || 0,
        duties_percent: Number(duties_percent) || 0,
        description: description || null,
        selected_account_id: selected_account_id || null,
        ...buyerData,
      });
      return this.response(res, 201, true, 'ثبت شد', created);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در ایجاد', null, err.message);
    }
  }

  async getOneInvoice(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findByPk(id);
      if (!invoice) return this.response(res, 404, false, 'یافت نشد');
      return this.response(res, 200, true, 'جزئیات', invoice);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در دریافت', null, err.message);
    }
  }

  async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findByPk(id);
      if (!invoice) return this.response(res, 404, false, 'یافت نشد');

      const updatable = {
        file_number: req.body?.file_number,
        invoice_date: req.body?.invoice_date,
        buyer_legal_name: req.body?.buyer_legal_name,
        buyer_province: req.body?.buyer_province,
        buyer_city: req.body?.buyer_city,
        buyer_address: req.body?.buyer_address,
        buyer_registration_number: req.body?.buyer_registration_number,
        buyer_economic_code: req.body?.buyer_economic_code,
        buyer_postal_code: req.body?.buyer_postal_code,
        buyer_national_identifier: req.body?.buyer_national_identifier,
        buyer_phone: req.body?.buyer_phone,
        buyer_fax: req.body?.buyer_fax,
        items: req.body?.items,
        travel_cost: req.body?.travel_cost,
        tax_percent: req.body?.tax_percent,
        duties_percent: req.body?.duties_percent,
        description: req.body?.description,
        selected_account_id: req.body?.selected_account_id,
      };

      // Remove undefined keys to avoid overwriting with undefined
      Object.keys(updatable).forEach(k => updatable[k] === undefined && delete updatable[k]);

      await invoice.update(updatable);
      return this.response(res, 200, true, 'به‌روزرسانی شد', invoice);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در به‌روزرسانی فاکتور', null, err.message);
    }
  }

  async convertProformaToInvoice(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findByPk(id);
      if (!invoice) return this.response(res, 404, false, 'یافت نشد');
      if (invoice.type !== 'proforma') return this.response(res, 400, false, 'این رکورد پیش‌فاکتور نیست');
      const newNumber = await this.generateNextNumber('invoice');
      await invoice.update({ type: 'invoice', number: newNumber });
      return this.response(res, 200, true, 'تبدیل شد', invoice);
    } catch (err) {
      return this.response(res, 500, false, 'خطا در تبدیل', null, err.message);
    }
  }

  async exportDocx(req, res) {
    try {
      const timestamp = Date.now();
      console.log('🔥 NEW UPDATED EXPORT DOCX METHOD CALLED - ID:', req.params.id, 'TIMESTAMP:', timestamp);
      const { id } = req.params;
      
      // Fetch invoice data
      const invoice = await Invoice.findByPk(id);
      if (!invoice) return this.response(res, 404, false, 'فاکتور یافت نشد');
      
      console.log('📄 Invoice found:', invoice.number, 'Items:', invoice.items?.length || 0);
      
      // Fetch seller settings
      let seller = await AccountingSettings.findOne();
      if (!seller) seller = await AccountingSettings.create({});
      
      // Fetch selected bank account
      let selectedAccount = null;
      if (invoice.selected_account_id) {
        selectedAccount = await BankAccount.findByPk(invoice.selected_account_id);
      }
      
      // Helper functions
      const toPersianDate = (iso) => {
        try { return iso ? new Date(iso).toLocaleDateString('fa-IR') : ''; } catch { return ''; }
      };
      
      const computeTotals = (items, travelCost, taxPercent, dutiesPercent) => {
        const itemsArray = Array.isArray(items) ? items : [];
        const subtotal = itemsArray.reduce((sum, item) => {
          const qty = Number(item.quantity || 0);
          const unitPrice = Number(item.unitPrice || 0);
          return sum + (qty * unitPrice);
        }, 0);
        
        const totalDiscount = itemsArray.reduce((sum, item) => {
          const qty = Number(item.quantity || 0);
          const unitPrice = Number(item.unitPrice || 0);
          const itemTotal = qty * unitPrice;
          const discountValue = item.discountType === 'percent' 
            ? Math.round((Number(item.discount || 0) / 100) * itemTotal)
            : Number(item.discount || 0);
          return sum + discountValue;
        }, 0);
        
        const afterDiscount = subtotal - totalDiscount;
        const travel = Number(travelCost || 0);
        const taxAmount = Math.round((Number(taxPercent || 0) / 100) * afterDiscount);
        const dutiesAmount = Math.round((Number(dutiesPercent || 0) / 100) * afterDiscount);
        const grandTotal = afterDiscount + travel + taxAmount + dutiesAmount;
        
        return { subtotal, totalDiscount, afterDiscount, travelCost: travel, taxAmount, dutiesAmount, grandTotal };
      };
      
      const totals = computeTotals(invoice.items, invoice.travel_cost, invoice.tax_percent, invoice.duties_percent);
      
      // Helper function for Persian text with B Nazanin font
      const createPersianText = (text, size = 14, bold = false) => new TextRun({
        text,
        size,
        bold,
        font: "B Nazanin"
      });
      
        // Create Word document with landscape orientation and Persian formatting
        const doc = new Document({
          styles: {
            default: {
              document: {
                run: {
                  font: "B Nazanin",
                  size: 24,
                  rightToLeft: true
                },
                paragraph: {
                  alignment: AlignmentType.RIGHT
                }
              }
            }
          },
          sections: [{
            properties: {
              page: {
                size: {
                  orientation: PageOrientation.LANDSCAPE,
                  width: 16838, // 11.69 inches in twips (landscape width)
                  height: 11906 // 8.27 inches in twips (landscape height)
                },
                margin: {
                  top: 720,    // 0.5 inch in twips
                  right: 720,  // 0.5 inch in twips
                  bottom: 720, // 0.5 inch in twips
                  left: 720    // 0.5 inch in twips
                }
              }
            },
          children: [
            // Document code at top
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                createPersianText("AFG-FR-162-R1", 16, true)
              ]
            }),
            
            // Header section with logo, title, and invoice details
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE }
              },
              rows: [
                new TableRow({
                  children: [
                    // Logo and company info cell
                    new TableCell({
                      width: { size: 25, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                             createPersianText("لوگوی شرکت", 14, true)
                          ]
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                             createPersianText("بسمه تعالی", 16, true)
                          ]
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                             createPersianText(seller?.seller_name || 'شرکت بازرسی مهندسی آریا فولاد قرن', 14, true)
                          ]
                        })
                      ]
                    }),
                    // Title cell
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                             createPersianText("صورتحساب فروش کالا و خدمات", 24, true)
                          ]
                        })
                      ]
                    }),
                    // Invoice details cell
                    new TableCell({
                      width: { size: 25, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [
                             createPersianText(`شماره: ${invoice.number || '-'}`, 16, true)
                          ]
                        }),
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [
                             createPersianText(`تاریخ: ${toPersianDate(invoice.invoice_date)}`, 16, true)
                          ]
                        }),
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [
                             createPersianText(`شماره پرونده: ${invoice.file_number || '-'}`, 16, true)
                          ]
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            
            // Spacing
            new Paragraph({ children: [new TextRun({ text: " " })] }),
            
            // Seller and Buyer info table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 }
              },
              rows: [
                // Headers row
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                             createPersianText("مشخصات فروشنده", 16, true)
                          ]
                        })
                      ]
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                             createPersianText("مشخصات خریدار", 16, true)
                          ]
                        })
                      ]
                    })
                  ]
                }),
                // Content row
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({
                              text: `${seller?.seller_name || 'شرکت فنی مهندسی آریا فولاد قرن'} - ${seller?.seller_province || 'خوزستان'}، ${seller?.seller_city || 'اهواز'} - ${seller?.seller_address || 'کوروش 20 اقبال'}`,
                              size: 14
                            })
                          ]
                        })
                      ]
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({
                              text: `${invoice.buyer_legal_name || '-'} | ${invoice.buyer_province || '-'} | ${invoice.buyer_city || '-'} | ${invoice.buyer_address || '-'} | ${invoice.buyer_registration_number || '-'} | ${invoice.buyer_economic_code || '-'} | ${invoice.buyer_postal_code || '-'} | ${invoice.buyer_national_identifier || '-'} | ${invoice.buyer_phone || '-'} | ${invoice.buyer_fax || '-'}`,
                              size: 14
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            
            // Spacing
            new Paragraph({ children: [new TextRun({ text: " " })] }),
            
            // Items table with header
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 }
              },
              rows: [
                // Table title row
                new TableRow({
                  children: [
                    new TableCell({ 
                      columnSpan: 5,
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: "شرح کالا یا خدمات", bold: true, size: 14 })] 
                        })
                      ] 
                    }),
                    new TableCell({ 
                      columnSpan: 6,
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: "مبالغ (ریال)", bold: true, size: 14 })] 
                        })
                      ] 
                    })
                  ]
                }),
                // Header row
                new TableRow({
                  children: [
                    new TableCell({ 
                      width: { size: 5, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ردیف", bold: true, size: 12 })] })] 
                    }),
                    new TableCell({ 
                      width: { size: 25, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "شرح کالا یا خدمات", bold: true, size: 12 })] })] 
                    }),
                    new TableCell({ 
                      width: { size: 8, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "مقدار", bold: true, size: 12 })] })] 
                    }),
                    new TableCell({ 
                      width: { size: 8, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "واحد", bold: true, size: 12 })] })] 
                    }),
                    new TableCell({ 
                      width: { size: 10, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "مبلغ واحد (ریال)", bold: true, size: 12 })] })] 
                    }),
                    new TableCell({ 
                      width: { size: 10, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "مبلغ کل (ریال)", bold: true, size: 12 })] })] 
                    }),
                    new TableCell({ 
                      width: { size: 8, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "مبلغ تخفیف", bold: true, size: 12 })] })] 
                    }),
                    new TableCell({ 
                      width: { size: 8, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "مبلغ کل پس از تخفیف", bold: true, size: 12 })] })] 
                    }),
                    new TableCell({ 
                      width: { size: 8, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ایاب و ذهاب", bold: true, size: 12 })] })] 
                    }),
                    new TableCell({ 
                      width: { size: 10, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "جمع مالیات و عوارض (ریال)", bold: true, size: 12 })] })] 
                    }),
                    new TableCell({ 
                      width: { size: 10, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "جمع مبلغ کل (ریال)", bold: true, size: 12 })] })] 
                    })
                  ]
                }),
                // Data rows
                ...(Array.isArray(invoice.items) && invoice.items.length > 0 
                  ? invoice.items.map((item, index) => {
                      const qty = Number(item.quantity || 0);
                      const unitPrice = Number(item.unitPrice || 0);
                      const itemTotal = qty * unitPrice;
                      const discountValue = item.discountType === 'percent' 
                        ? Math.round((Number(item.discount || 0) / 100) * itemTotal)
                        : Number(item.discount || 0);
                      const afterDiscount = Math.max(itemTotal - discountValue, 0);
                      const itemTravelCost = invoice.items.length > 0 ? Math.round(totals.travelCost / invoice.items.length) : 0;
                      const itemTaxAmount = Math.round((Number(invoice.tax_percent || 0) / 100) * afterDiscount);
                      const itemDutiesAmount = Math.round((Number(invoice.duties_percent || 0) / 100) * afterDiscount);
                      const itemGrandTotal = afterDiscount + itemTravelCost + itemTaxAmount + itemDutiesAmount;
                      
                      return new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (index + 1).toString(), size: 12 })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: item.description || '-', size: 12 })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: qty.toLocaleString('fa-IR'), size: 12 })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.unit || '1', size: 12 })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: unitPrice.toLocaleString('fa-IR'), size: 12 })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: itemTotal.toLocaleString('fa-IR'), size: 12 })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: discountValue.toLocaleString('fa-IR'), size: 12 })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: afterDiscount.toLocaleString('fa-IR'), size: 12 })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: itemTravelCost.toLocaleString('fa-IR'), size: 12 })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (itemTaxAmount + itemDutiesAmount).toLocaleString('fa-IR'), size: 12 })] })] }),
                          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: itemGrandTotal.toLocaleString('fa-IR'), size: 12 })] })] })
                        ]
                      });
                    })
                  : []
                ),
                // Add empty rows to fill space (like in the preview)
                ...Array.from({length: Math.max(0, 8 - (invoice.items?.length || 0))}, (_, i) => 
                  new TableRow({
                    children: Array.from({length: 11}, () => 
                      new TableCell({ 
                        children: [new Paragraph({ children: [new TextRun({ text: " ", size: 12 })] })] 
                      })
                    )
                  })
                )
              ]
            }),
            
            // Spacing
            new Paragraph({ children: [new TextRun({ text: " " })] }),
            
            // Description section
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 }
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ text: "توضیحات", bold: true, size: 16 })]
                        }),
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [new TextRun({ text: invoice.description || 'توضیحاتی ثبت نشده است', size: 14 })]
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            
            // Spacing
            new Paragraph({ children: [new TextRun({ text: " " })] }),
            
            // Payment info section
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 }
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ text: "اطلاعات پرداخت", bold: true, size: 16 })]
                        }),
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [new TextRun({ 
                            text: selectedAccount 
                              ? `لطفا مبلغ فوق را به شماره حساب جاری ${selectedAccount.account_number} بانک ${selectedAccount.bank_name} به کد ${selectedAccount.bank_code || '011'} بنام شرکت ${seller?.seller_name || 'شرکت بازرسی مهندسی آریا فولاد قرن'} و یا با شماره شبا ${selectedAccount.iban || '****'} واریز نمایید.`
                              : 'حساب بانکی انتخاب نشده است',
                            size: 14 
                          })]
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            
            // Spacing
            new Paragraph({ children: [new TextRun({ text: " " })] }),
            
            // Totals section
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 }
              },
              rows: [
                // Totals header
                new TableRow({
                  children: [
                    new TableCell({ 
                      columnSpan: 5,
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: "جمع مبلغ کل", bold: true, size: 14 })] 
                        })
                      ] 
                    }),
                    new TableCell({ 
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: "عوارض/مالیات (ریال)", bold: true, size: 14 })] 
                        })
                      ] 
                    }),
                    new TableCell({ 
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: "مبلغ کل پس از تخفیف", bold: true, size: 14 })] 
                        })
                      ] 
                    }),
                    new TableCell({ 
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: "تخفیف", bold: true, size: 14 })] 
                        })
                      ] 
                    }),
                    new TableCell({ 
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: "مبلغ کل (جمع مبالغ ستون کالا)", bold: true, size: 14 })] 
                        })
                      ] 
                    })
                  ]
                }),
                // Totals data
                new TableRow({
                  children: [
                    new TableCell({ 
                      columnSpan: 5,
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: " ", size: 14 })] 
                        })
                      ] 
                    }),
                    new TableCell({ 
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: (totals.taxAmount + totals.dutiesAmount).toLocaleString('fa-IR'), size: 14 })] 
                        })
                      ] 
                    }),
                    new TableCell({ 
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: totals.afterDiscount.toLocaleString('fa-IR'), size: 14 })] 
                        })
                      ] 
                    }),
                    new TableCell({ 
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: totals.totalDiscount.toLocaleString('fa-IR'), size: 14 })] 
                        })
                      ] 
                    }),
                    new TableCell({ 
                      children: [
                        new Paragraph({ 
                          alignment: AlignmentType.CENTER, 
                          children: [new TextRun({ text: totals.subtotal.toLocaleString('fa-IR'), size: 14 })] 
                        })
                      ] 
                    })
                  ]
                })
              ]
            }),
            
            // Spacing
            new Paragraph({ children: [new TextRun({ text: " " })] }),
            
            // Final total
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `جمع کل قابل پرداخت: ${totals.grandTotal.toLocaleString('fa-IR')} ریال`, bold: true, size: 18 })
              ]
            }),
            
            // Spacing
            new Paragraph({ children: [new TextRun({ text: " " })] }),
            
            // Signature section
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 }
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ text: "امضای شرکت", bold: true, size: 16 })]
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ text: "امضا و مهر شرکت", size: 14 })]
                        }),
                        new Paragraph({ children: [new TextRun({ text: " " })] }),
                        new Paragraph({ children: [new TextRun({ text: " " })] }),
                        new Paragraph({ children: [new TextRun({ text: " " })] })
                      ]
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ text: "امضا مشتری", bold: true, size: 16 })]
                        }),
                        new Paragraph({ children: [new TextRun({ text: " " })] }),
                        new Paragraph({ children: [new TextRun({ text: " " })] }),
                        new Paragraph({ children: [new TextRun({ text: " " })] }),
                        new Paragraph({ children: [new TextRun({ text: " " })] })
                      ]
                    })
                  ]
                })
              ]
            }),
            
            // Spacing
            new Paragraph({ children: [new TextRun({ text: " " })] }),
            
            // Additional details section (like in preview)
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ 
                  text: `جمع جزء: ${totals.subtotal.toLocaleString('fa-IR')} ریال`, 
                  size: 14 
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ 
                  text: `تخفیف کل: ${totals.totalDiscount.toLocaleString('fa-IR')} ریال`, 
                  size: 14 
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ 
                  text: `پس از تخفیف: ${totals.afterDiscount.toLocaleString('fa-IR')} ریال`, 
                  size: 14 
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ 
                  text: `ایاب و ذهاب: ${totals.travelCost.toLocaleString('fa-IR')} ریال`, 
                  size: 14 
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ 
                  text: `مالیات (${invoice.tax_percent || 9.00}%): ${totals.taxAmount.toLocaleString('fa-IR')} ریال`, 
                  size: 14 
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ 
                  text: `عوارض (${invoice.duties_percent || 3.00}%): ${totals.dutiesAmount.toLocaleString('fa-IR')} ریال`, 
                  size: 14 
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ 
                  text: `جمع کل قابل پرداخت: ${totals.grandTotal.toLocaleString('fa-IR')} ریال`, 
                  bold: true,
                  size: 16 
                })
              ]
            })
          ]
        }]
      });
      
      // Generate buffer
      const buffer = await Packer.toBuffer(doc);
      
      // Set response headers with strong cache-busting
      const fileTimestamp = Date.now();
      const invoiceType = invoice.type === 'invoice' ? 'Invoice' : 'Proforma';
      const filename = `${invoiceType}-${invoice.number || invoice.id}-${fileTimestamp}.docx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.send(buffer);
      
    } catch (err) {
      console.error('Export DOCX error:', err);
      return this.response(res, 500, false, 'خطا در تولید فایل Word', null, err.message);
    }
  }
}

module.exports = new AccountingController();


