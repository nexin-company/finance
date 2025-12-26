# Finance Backend

Backend del módulo **Finance** (tesorería + AR/AP).

## Alcance (MVP)

### AR (Cuentas por cobrar)
- Aplicación de pagos a órdenes/documentos.
- Estado de cuenta por cliente.
- Aging básico.

### Tesorería
- Registro de transferencias (manual).
- Evidencia / comprobantes.
- Saldos por cuenta (básico).

### AP (fase 2 o integrado con Procurement)
- Facturas de proveedor y programación de pago.

## Integraciones

- Vendor: fuente de eventos comerciales (orden/pago) → Finance (cartera).
- Procurement: facturas proveedor → Finance (AP/tesorería).
- Permit: usuarios, auditoría, notificaciones.


