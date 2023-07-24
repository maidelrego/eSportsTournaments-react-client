import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export const FifaTable = (teams) => {

  
  const columns = [
    {field: 'teamName', header: 'Team'},
    {field: 'played', header: 'Played'},
    {field: 'draws', header: 'Draws'},
    {field: 'lost', header: 'Lost'},
    {field: 'scored', header: 'Scored'},
    {field: 'against', header: 'Against'},
    {field: 'difference', header: 'Difference'},
    {field: 'points', header: 'Points'}
  ];

  return (
    <div className="card">
      <DataTable value={teams}>
        {columns.map((col) => (
          <Column key={col.field} field={col.field} header={col.header} />
        ))}
      </DataTable>
    </div>
  );
}

        