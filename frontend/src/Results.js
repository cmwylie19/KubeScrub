import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';

// Generate Order Data
function createData(id, date, name, shipTo, paymentMethod, amount) {
  return { id, date, name, shipTo, paymentMethod, amount };
}

const rows = [
  createData(
    0,
    '16 Mar, 2023',
    'Config Map',
    'app-config',
    'kubefs',
    312.44,
  ),
  createData(
    1,
    '16 Mar, 2023',
    'Secret',
    'kubescrub-creds',
    'kubescrub',
    866.99,
  ),
  createData(2, '16 Mar, 2023', 'Config Map', 'prometheus-config', 'default', 100.81),
  createData(
    3,
    '16 Mar, 2023',
    'Service',
    'nginx',
    'default',
    654.39,
  ),
  createData(
    4,
    '15 Mar, 2023',
    'Secret',
    'test-secret',
    'default',
    212.79,
  ),
];

function preventDefault(event) {
  event.preventDefault();
}

export default function Results() {
  return (
    <React.Fragment>
      <Title>Orphaned Resources</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Resource</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Namespace</TableCell>
            <TableCell align="right">Prune</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.shipTo}</TableCell>
              <TableCell>{row.paymentMethod}</TableCell>
              <TableCell align="right">{`$${row.amount}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

    </React.Fragment>
  );
}
