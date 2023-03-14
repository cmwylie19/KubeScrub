import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import { Typography } from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import FmdGoodIcon from '@mui/icons-material/FmdGood';


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
            <TableRow key={row.metadata.uid}>
              <TableCell>{row.kind}</TableCell>
              <TableCell>{row.metadata.name}</TableCell>
              <TableCell>{row.metadata.namespace}</TableCell>
              <TableCell align="right">{row.metadata.annotations.exists ===  "true"? <FmdGoodIcon color="success"/> : <ReportIcon color="error" />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

    </React.Fragment>
  );
}
