import * as React from 'react';
import Link from '@mui/material/Link';
import { ResponsiveContainer, PieChart, Pie,Cell, Legend } from 'recharts';
import Typography from '@mui/material/Typography';
import Title from './Title';


const COLORS = ['transparent','#00C49F', '#FFBB28', '#FF8042'];


export default function PieLayout({data}) {
  const [pieData, setPieData] = React.useState();

  React.useEffect(() => {
    // count total data
    let count = 0
    Array.isArray(data) && data.map((item) => item.metadata.annotations.exists == "true" && count++)
    let tempData = [{
      name: 'Total',
      value: Array.isArray(data) ? data.length - count : 0
    }, {
      name: 'Orphaned',
      value: count
    }]
    return setPieData(tempData)
  }, [pieData]);

  return (
    <React.Fragment>
      <Title>Orphaned Resources Percentages</Title>
      <Typography component="p" variant="h4">
        {Number.parseFloat((Array.isArray(pieData) ? pieData[1].value : 0)/(Array.isArray(pieData) ? pieData.length : 0)*100).toFixed(0)}%
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        Orphaned Resources 
      </Typography>
      <ResponsiveContainer>
          <PieChart>
          <Legend />
            <Pie dataKey="value" data={pieData} fill="#2196f3" label>
            {
          Array.isArray(pieData) &&	pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]}/>)
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
