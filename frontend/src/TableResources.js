import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import { Typography } from '@mui/material';


export default function TableResources({data}) {
  return (
    <React.Fragment>
      <Title>Orphaned Resources</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Resource</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Namespace</TableCell>
            <TableCell align="right">Orphaned</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(data) && data.map((row) => (
            <TableRow >
              <TableCell>{row.kind}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.namespace}</TableCell>
              <TableCell align="right">{row.exists ===  true? <Typography color="lightgreen">NO</Typography> : <Typography color="orange">YES</Typography>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

    </React.Fragment>
  );
}
