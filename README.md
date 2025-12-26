# Finance Juampamillan (Tesorería + AR/AP + Contabilidad)

Este repo será el módulo **Finance** del ecosistema ERP modular.

## Propósito

Centralizar todo lo relacionado a **finanzas** de la operación:

- **Tesorería**: cuentas bancarias, movimientos, conciliación, flujo de efectivo.
- **Cuentas por cobrar (AR)**: cartera, aplicación de pagos, estado de cuenta, aging.
- **Cuentas por pagar (AP)**: facturas proveedor, programación de pagos, aprobaciones.
- **Contabilidad (GL)**: pólizas, catálogo de cuentas, periodos (si se decide incluirlo en el MVP o fase 2).

> Nota: Vendor capturará pagos manuales (transferencias) para marcar órdenes como pagadas, pero Finance debe ser el **source of truth financiero** para cartera (AR) y conciliación.

## No incluye

- Órdenes de venta (Vendor)
- Stock/availability (Inventory)
- Embarques/tracking (Shipments)
- Catálogo interno manufactura (Factory)
- Users/RBAC/auditoría/notificaciones (Permit)

## Integraciones (HTTP)

### Vendor → Finance

- Publicar/consultar eventos financieros de ventas:
  - orden confirmada
  - pago registrado
  - cancelación / nota de crédito (futuro)

### Procurement → Finance

- Facturas de proveedor, programación de pagos.

### Permit → Finance

- Users (quién ejecuta acciones)
- Audit logs (aprobaciones, cambios)
- Notifications (alertas de vencimientos)

## Roadmap / Backlog (alto nivel)

### Must (MVP)

- `finance-backend`:
  - customers_ar (subledger de clientes) o integración con customerId de Vendor
  - payment_applications (aplicación de pagos a documentos)
  - bank_transfers (registro de transferencias y evidencia)
  - vendors_ap (proveedores) (si se comparte con Procurement, definir ownership)
  - payables_invoices (facturas proveedor) (si se comparte con Procurement)
  - cash_accounts (cuentas bancarias) + movimientos básicos
- Endpoints mínimos:
  - `POST /v1/ar/payments` (registrar pago y aplicar a orden/documento)
  - `GET /v1/ar/aging`
  - `POST /v1/treasury/transfers`
  - `GET /v1/treasury/balances`

### Should

- Conciliación bancaria semi-manual.
- Términos de pago y vencimientos (dunning/recordatorios).

### Could

- GL completo (pólizas, COA, periodos).
- Integración fiscal (si aplica).


