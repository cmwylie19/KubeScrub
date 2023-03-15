import * as React from 'react';
import { ResponsiveContainer, PieChart, Pie,Cell, Legend } from 'recharts';
import Typography from '@mui/material/Typography';
import Title from './Title';


const COLORS = ['green','orange', '#FFBB28', '#FF8042'];


export default function PieLayout({data}) {

  return (
    <React.Fragment>
      <Title>Orphaned Resources Percentages</Title>
      <Typography component="p" variant="h4">
        {Number.parseFloat((Array.isArray(data) ? data[1].value : 0)/(Array.isArray(data) ? data[0].value + data[1].value : 0)*100).toFixed(0)}%       <Typography color="text.secondary" style={{fontWeight:"bold", display:"flex"}}>
        Orphaned Resources 
      </Typography>
      </Typography>

      <ResponsiveContainer>
          <PieChart>
          <Legend />
            <Pie dataKey="value" data={data} fill="#2196f3" label>
            {
          Array.isArray(data) &&	data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]}/>)
          }
            </Pie>
          </PieChart>
        </ResponsiveContainer>
    </React.Fragment>
  );
}


// import React, { PureComponent } from 'react';




// export default class Example extends PureComponent {
//   static demoUrl = 'https://codesandbox.io/s/pie-chart-in-responsive-container-qyv6t';

//   render() {
//     return (
//       <div style={{ width: '100%', height: 300 }}>
       
//       </div>
//     );
//   }
// }
