import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define interfaces for type safety
interface ClientData {
  client_id: string;
  client_name: string;
  data: any;
}

interface AllData {
  campaigns: ClientData[];
  auction_insights: ClientData[];
  audience_demographics: ClientData[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');
  const dataType = searchParams.get('data_type');

  // Path to the data directory where JSON files are stored
  const dataDir = '/home/ubuntu/data';

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir}`);
    return NextResponse.json(
      { error: 'Data directory not found. Please ensure data is being generated.' },
      { status: 500 }
    );
  }

  try {
    if (dataType === 'all_clients_data') {
      const allData: AllData = {
        campaigns: [],
        auction_insights: [],
        audience_demographics: []
      };

      const files = fs.readdirSync(dataDir);
      
      for (const file of files) {
        const filePath = path.join(dataDir, file);
        
        // Skip directories and non-JSON files
        if (!fs.lstatSync(filePath).isFile() || !file.endsWith('.json')) {
          continue;
        }

        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Skip empty files or files with just whitespace
          if (!fileContent.trim()) {
            console.warn(`Skipping empty or whitespace-only file: ${file}`);
            continue;
          }

          let parsedData;
          try {
            parsedData = JSON.parse(fileContent);
          } catch (parseError) {
            console.error(`Invalid JSON in file ${file}:`, parseError);
            continue;
          }

          // Extract client ID and name from filename using a more robust approach
          const parts = file.split('_');
          let currentClientId = '';
          let currentClientName = '';
          let fileType = '';

          if (file.endsWith('_campaigns.json')) {
            fileType = 'campaigns';
            currentClientId = parts[0];
            currentClientName = parts.slice(1, parts.length - 1).join('_');
          } else if (file.endsWith('_auction_insights.json')) {
            fileType = 'auction_insights';
            currentClientId = parts[0];
            currentClientName = parts.slice(1, parts.length - 2).join('_');
          } else if (file.endsWith('_audience_demographics.json')) {
            fileType = 'audience_demographics';
            currentClientId = parts[0];
            currentClientName = parts.slice(1, parts.length - 2).join('_');
          } else {
            console.warn(`Skipping file with unrecognized pattern: ${file}`);
            continue; // Skip files that don't match expected patterns
          }

          // Fallback for client name if extraction fails or is empty
          if (!currentClientName) {
            currentClientName = 'Unknown Client';
          }

          const clientData: ClientData = {
            client_id: currentClientId,
            client_name: currentClientName,
            data: parsedData
          };

          if (fileType === 'campaigns') {
            allData.campaigns.push(clientData);
          } else if (fileType === 'auction_insights') {
            allData.auction_insights.push(clientData);
          } else if (fileType === 'audience_demographics') {
            allData.audience_demographics.push(clientData);
          }
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError);
          // Continue to next file even if one file causes an error
        }
      }

      return NextResponse.json(allData);
    } else if (customerId && dataType) {
      // Return data for a specific client and data type
      const files = fs.readdirSync(dataDir);
      const targetFile = files.find(file => 
        file.startsWith(`${customerId}_`) && file.endsWith(`_${dataType}.json`)
      );

      if (!targetFile) {
        console.warn(`No data file found for customer ${customerId} and data type ${dataType}`);
        return NextResponse.json(
          { error: `No data found for customer ${customerId} and data type ${dataType}` },
          { status: 404 }
        );
      }

      const filePath = path.join(dataDir, targetFile);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      if (!fileContent.trim()) {
        console.warn(`Data file is empty for customer ${customerId} and data type ${dataType}: ${targetFile}`);
        return NextResponse.json(
          { error: `Data file is empty for customer ${customerId} and data type ${dataType}` },
          { status: 404 }
        );
      }

      let data;
      try {
        data = JSON.parse(fileContent);
      } catch (parseError) {
        console.error(`Invalid JSON in file ${targetFile}:`, parseError);
        return NextResponse.json(
          { error: `Invalid data format for customer ${customerId} and data type ${dataType}` },
          { status: 500 }
        );
      }
      return NextResponse.json(data);
    } else {
      // If no specific customerId/dataType and not 'all_clients_data', return a bad request
      return NextResponse.json(
        { error: 'Invalid request. Please provide customer_id and data_type, or request all_clients_data.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error during data processing' },
      { status: 500 }
    );
  }
}


