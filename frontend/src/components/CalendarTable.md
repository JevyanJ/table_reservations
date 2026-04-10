# CalendarTable

Componente de calendario visual para reservas de mesas.

- Cada columna es una franja de media hora.
- Cada fila es una mesa.
- Las celdas muestran si la mesa está reservada en ese horario (rojo) o libre (verde).

## Props

- `timeSlots`: array de strings con las horas (ej: ['09:00', '09:30', ...])
- `tables`: array de mesas
- `reservations`: array de reservas (debe incluir table, start, end)
- `date`: string YYYY-MM-DD

## Uso

```jsx
<CalendarTable
  timeSlots={timeSlots}
  tables={tables}
  reservations={slots}
  date={date}
/>
```

## Personalización

- Los colores pueden cambiarse en el prop `sx` de cada celda.
- El texto de la celda puede personalizarse.
