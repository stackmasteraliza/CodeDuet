import React, { useState, useRef, useEffect } from 'react';
import { Play, Database, AlertCircle, CheckCircle, Copy, Download } from 'lucide-react';


const SQLCompilerApp = () => {
  const [sqlCode, setSqlCode] = useState(`-- Welcome to SQL Compiler
-- Try some sample queries:

SELECT * FROM users WHERE age > 25;

-- or

SELECT name, email, age 
FROM users 
ORDER BY age DESC 
LIMIT 5;`);

  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const textareaRef = useRef(null);

  // Sample database
  const sampleData = {
    users: [
      { id: 1, name: 'Alice Johnson', email: 'alice@email.com', age: 28, department: 'Engineering' },
      { id: 2, name: 'Bob Smith', email: 'bob@email.com', age: 34, department: 'Marketing' },
      { id: 3, name: 'Carol Davis', email: 'carol@email.com', age: 29, department: 'Engineering' },
      { id: 4, name: 'David Wilson', email: 'david@email.com', age: 42, department: 'Sales' },
      { id: 5, name: 'Eva Brown', email: 'eva@email.com', age: 31, department: 'HR' },
      { id: 6, name: 'Frank Miller', email: 'frank@email.com', age: 27, department: 'Engineering' },
      { id: 7, name: 'Grace Lee', email: 'grace@email.com', age: 36, department: 'Marketing' }
    ],
    products: [
      { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', stock: 50 },
      { id: 2, name: 'Mouse', price: 25.99, category: 'Electronics', stock: 200 },
      { id: 3, name: 'Keyboard', price: 79.99, category: 'Electronics', stock: 150 },
      { id: 4, name: 'Monitor', price: 299.99, category: 'Electronics', stock: 75 },
      { id: 5, name: 'Desk Chair', price: 199.99, category: 'Furniture', stock: 30 }
    ],
    orders: [
      { id: 1, user_id: 1, product_id: 1, quantity: 1, order_date: '2024-01-15' },
      { id: 2, user_id: 2, product_id: 2, quantity: 2, order_date: '2024-01-16' },
      { id: 3, user_id: 1, product_id: 3, quantity: 1, order_date: '2024-01-17' },
      { id: 4, user_id: 3, product_id: 1, quantity: 1, order_date: '2024-01-18' }
    ]
  };

  // Simple SQL parser and executor
  const executeSql = (query) => {
    const startTime = Date.now();

    try {
      // Clean and normalize the query
      const cleanQuery = query.trim().replace(/;$/, '');
      const upperQuery = cleanQuery.toUpperCase();

      // Handle SELECT queries
      if (upperQuery.startsWith('SELECT')) {
        return executeSelect(cleanQuery);
      }

      // Handle SHOW TABLES
      if (upperQuery.includes('SHOW TABLES')) {
        return Object.keys(sampleData).map(table => ({ table_name: table }));
      }

      // Handle DESCRIBE/DESC
      if (upperQuery.startsWith('DESCRIBE') || upperQuery.startsWith('DESC')) {
        const tableName = cleanQuery.split(/\s+/)[1]?.toLowerCase();
        if (sampleData[tableName] && sampleData[tableName].length > 0) {
          const columns = Object.keys(sampleData[tableName][0]);
          return columns.map(col => ({
            column_name: col,
            data_type: typeof sampleData[tableName][0][col] === 'number' ? 'INTEGER' : 'VARCHAR'
          }));
        }
        throw new Error(`Table '${tableName}' doesn't exist`);
      }

      throw new Error('Only SELECT, SHOW TABLES, and DESCRIBE queries are supported in this demo');

    } catch (err) {
      throw err;
    } finally {
      setExecutionTime(Date.now() - startTime);
    }
  };

  const executeSelect = (query) => {
    // Extract table name
    const fromMatch = query.match(/FROM\s+(\w+)/i);
    if (!fromMatch) throw new Error('FROM clause is required');

    const tableName = fromMatch[1].toLowerCase();
    if (!sampleData[tableName]) {
      throw new Error(`Table '${tableName}' doesn't exist`);
    }

    let result = [...sampleData[tableName]];

    // Handle WHERE clause
    const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s+GROUP\s+BY|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      result = result.filter(row => evaluateWhere(row, whereClause));
    }

    // Handle ORDER BY
    const orderMatch = query.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      const column = orderMatch[1];
      const direction = orderMatch[2]?.toUpperCase() || 'ASC';
      result.sort((a, b) => {
        if (direction === 'DESC') {
          return b[column] > a[column] ? 1 : -1;
        }
        return a[column] > b[column] ? 1 : -1;
      });
    }

    // Handle LIMIT
    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      result = result.slice(0, parseInt(limitMatch[1]));
    }

    // Handle column selection
    const selectMatch = query.match(/SELECT\s+(.+?)\s+FROM/i);
    if (selectMatch) {
      const columns = selectMatch[1].trim();
      if (columns !== '*') {
        const selectedCols = columns.split(',').map(col => col.trim());
        result = result.map(row => {
          const newRow = {};
          selectedCols.forEach(col => {
            if (row.hasOwnProperty(col)) {
              newRow[col] = row[col];
            }
          });
          return newRow;
        });
      }
    }

    return result;
  };

  const evaluateWhere = (row, whereClause) => {
    // Simple WHERE clause evaluation (supports basic comparisons)
    const operators = ['>=', '<=', '!=', '>', '<', '='];

    for (const op of operators) {
      if (whereClause.includes(op)) {
        const [left, right] = whereClause.split(op).map(s => s.trim());
        const leftVal = row[left];
        const rightVal = isNaN(right) ? right.replace(/'/g, '') : parseFloat(right);

        switch (op) {
          case '=': return leftVal == rightVal;
          case '!=': return leftVal != rightVal;
          case '>': return leftVal > rightVal;
          case '<': return leftVal < rightVal;
          case '>=': return leftVal >= rightVal;
          case '<=': return leftVal <= rightVal;
        }
      }
    }
    return true;
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setError('');
    setResults([]);

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const queries = sqlCode.split(';').filter(q => q.trim() && !q.trim().startsWith('--'));

      if (queries.length === 0) {
        throw new Error('No valid SQL queries found');
      }

      const result = executeSql(queries[queries.length - 1]);
      setResults(Array.isArray(result) ? result : [result]);
    } catch (err) {
      setError(err.message);
    }

    setIsExecuting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      e.target.value = value.substring(0, start) + '  ' + value.substring(end);
      e.target.selectionStart = e.target.selectionEnd = start + 2;
      setSqlCode(e.target.value);
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleExecute();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    const csv = [
      Object.keys(results[0]).join(','),
      ...results.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
   <div className="min-h-screen bg-gray-50 p-4">

      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">SQL Compiler & Executor</h1>
          </div>
          <p className="text-gray-600">
            Write and execute SQL queries against sample data. Available tables: users, products, orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SQL Editor */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b p-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">SQL Query Editor</h2>
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex items-center gap-2 !bg-blue-600 text-white px-4 py-2 rounded-lg hover:!bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play size={16} />
                {isExecuting ? 'Executing...' : 'Execute (Ctrl+Enter)'}
              </button>
            </div>

            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={sqlCode}
                onChange={(e) => setSqlCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="!text-black w-full h-80 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="Enter your SQL query here..."
              />

              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>Tip: Use Ctrl+Enter to execute, Tab for indentation</span>
                <button
                  onClick={() => copyToClipboard(sqlCode)}
                  className="flex items-center p-2 rounded !border !border-gray-600  !bg-white gap-1 hover:!text-blue-600"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b p-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Query Results</h2>
              {results.length > 0 && (
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-500">
                    {results.length} rows • {executionTime}ms
                  </span>
                  <button
                    onClick={downloadResults}
                    className="!bg-white !border !border-blue-600 flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm px-3 py-1 rounded"
                  >
                    <Download size={14} />
                    CSV
                  </button>

                </div>
              )}
            </div>

            <div className="p-4 h-96 overflow-auto">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <h3 className="font-medium text-red-800">Query Error</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={18} />
                    <span className="font-medium">Query executed successfully</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200 text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {Object.keys(results[0]).map((key) => (
                            <th key={key} className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {Object.values(row).map((value, j) => (
                              <td key={j} className="!text-black border border-gray-200 px-3 py-2">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!error && results.length === 0 && !isExecuting && (
                <div className="text-center text-gray-500 py-12">
                  <Database size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No results to display</p>
                  <p className="text-sm mt-1">Execute a query to see results here</p>
                </div>
              )}

              {isExecuting && (
                <div className="text-center text-gray-500 py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Executing query...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sample Queries */}
        <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Sample Queries to Try</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Get all users",
                query: "SELECT * FROM users;"
              },
              {
                title: "Users by department",
                query: "SELECT name, department FROM users WHERE department = 'Engineering';"
              },
              {
                title: "Products under $100",
                query: "SELECT name, price FROM products WHERE price < 100 ORDER BY price;"
              },
              {
                title: "Show all tables",
                query: "SHOW TABLES;"
              }
            ].map((sample, i) => (
              <div key={i} className="border rounded-lg p-3">
                <h4 className="font-medium text-sm text-gray-700 mb-2">{sample.title}</h4>
                <code className="text-xs bg-gray-100 p-2 rounded block text-gray-800">
                  {sample.query}
                </code>
                <button
                  onClick={() => setSqlCode(sample.query)}
                  className="!bg-white text-blue-600 hover:text-blue-700 text-xs mt-2"
                >
                  Use this query
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLCompilerApp;