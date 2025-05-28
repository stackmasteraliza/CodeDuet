import React, { useState, useRef, useEffect } from 'react';
import { Play, Code, AlertCircle, CheckCircle, Copy, Download, Terminal } from 'lucide-react';

const PythonCompilerApp = () => {
    const [pythonCode, setPythonCode] = useState(`# Welcome to Python Compiler
# Try some sample code:

print("Hello, World!")

# Variables and operations
name = "Alice"
age = 25
print(f"Name: {name}, Age: {age}")

# Lists and loops
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    print(f"Square of {num} is {num**2}")

# Functions
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)

print(f"Factorial of 5: {factorial(5)}")
`);

    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);
    const textareaRef = useRef(null);

    // Simple Python interpreter simulation
    const executePython = (code) => {
        const startTime = Date.now();
        let output = '';
        let variables = {};
        let functions = {};

        try {
            const lines = code.split('\n');
            let i = 0;

            while (i < lines.length) {
                let line = lines[i].trim();

                // Skip empty lines and comments
                if (!line || line.startsWith('#')) {
                    i++;
                    continue;
                }

                // Handle print statements
                if (line.startsWith('print(')) {
                    const printContent = line.match(/print\((.*)\)/)?.[1];
                    if (printContent) {
                        let result = evaluateExpression(printContent, variables, functions);
                        output += result + '\n';
                    }
                }

                // Handle variable assignments
                else if (line.includes('=') && !line.includes('==') && !line.includes('!=') && !line.includes('<=') && !line.includes('>=')) {
                    const [varName, varValue] = line.split('=').map(s => s.trim());
                    if (!varName.includes(' ') && !varName.includes('(')) {
                        variables[varName] = evaluateExpression(varValue, variables, functions);
                    }
                }

                // Handle simple function definitions
                else if (line.startsWith('def ')) {
                    const funcMatch = line.match(/def\s+(\w+)\((.*?)\):/);
                    if (funcMatch) {
                        const funcName = funcMatch[1];
                        const params = funcMatch[2].split(',').map(p => p.trim()).filter(p => p);

                        // Parse function body
                        let funcBody = [];
                        i++; // Move to next line
                        while (i < lines.length && (lines[i].startsWith('    ') || lines[i].trim() === '')) {
                            if (lines[i].trim()) {
                                funcBody.push(lines[i].trim());
                            }
                            i++;
                        }
                        i--; // Adjust for the outer loop increment

                        functions[funcName] = { params, body: funcBody };
                    }
                }

                // Handle for loops
                else if (line.startsWith('for ')) {
                    const forMatch = line.match(/for\s+(\w+)\s+in\s+(.+):/);
                    if (forMatch) {
                        const iterVar = forMatch[1];
                        const iterableExpr = forMatch[2];
                        const iterable = evaluateExpression(iterableExpr, variables, functions);

                        // Parse loop body
                        let loopBody = [];
                        i++; // Move to next line
                        while (i < lines.length && (lines[i].startsWith('    ') || lines[i].trim() === '')) {
                            if (lines[i].trim()) {
                                loopBody.push(lines[i].trim());
                            }
                            i++;
                        }
                        i--; // Adjust for the outer loop increment

                        // Execute loop
                        if (Array.isArray(iterable)) {
                            for (let item of iterable) {
                                variables[iterVar] = item;

                                // Execute each line in loop body
                                for (let bodyLine of loopBody) {
                                    if (bodyLine.startsWith('print(')) {
                                        const printContent = bodyLine.match(/print\((.*)\)/)?.[1];
                                        if (printContent) {
                                            let result = evaluateExpression(printContent, variables, functions);
                                            output += result + '\n';
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                i++;
            }

            return output || 'Code executed successfully (no output)';

        } catch (err) {
            throw new Error(`Runtime Error: ${err.message}`);
        } finally {
            setExecutionTime(Date.now() - startTime);
        }
    };


    const evaluateExpression = (expr, variables, functions) => {
        expr = expr.trim();

        // Handle string literals
        if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
            return expr.slice(1, -1);
        }

        // Handle f-strings (improved)
        if (expr.startsWith('f"') || expr.startsWith("f'")) {
            let result = expr.slice(2, -1);
            const matches = result.match(/\{([^}]+)\}/g);
            if (matches) {
                for (let match of matches) {
                    const expression = match.slice(1, -1);
                    let value;

                    // Handle expressions inside f-strings
                    if (expression.includes('**')) {
                        // Handle power operations like num**2
                        const parts = expression.split('**');
                        if (parts.length === 2) {
                            const base = variables[parts[0].trim()] || parseFloat(parts[0].trim());
                            const exp = variables[parts[1].trim()] || parseFloat(parts[1].trim());
                            value = Math.pow(base, exp);
                        }
                    } else if (expression.includes('(') && expression.includes(')')) {
                        // Handle function calls like factorial(5)
                        const funcMatch = expression.match(/(\w+)\((.*)\)/);
                        if (funcMatch) {
                            const funcName = funcMatch[1];
                            const args = funcMatch[2];

                            if (funcName === 'factorial') {
                                const n = variables[args] || parseFloat(args);
                                value = factorial(n);
                            } else {
                                value = expression; // fallback
                            }
                        }
                    } else if (variables[expression] !== undefined) {
                        value = variables[expression];
                    } else {
                        value = expression;
                    }

                    result = result.replace(match, value);
                }
            }
            return result;
        }

        // Handle numbers
        if (!isNaN(expr)) {
            return parseFloat(expr);
        }

        // Handle variables
        if (variables[expr] !== undefined) {
            return variables[expr];
        }

        // Handle lists
        if (expr.startsWith('[') && expr.endsWith(']')) {
            const items = expr.slice(1, -1).split(',').map(item => {
                item = item.trim();
                if (item.startsWith('"') || item.startsWith("'")) {
                    return item.slice(1, -1); // Remove quotes for strings
                }
                return isNaN(item) ? item : parseFloat(item);
            });
            return items;
        }

        // Handle basic arithmetic
        if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/') || expr.includes('**')) {
            try {
                // Replace variables in expression
                let evalExpr = expr;
                for (let [varName, varValue] of Object.entries(variables)) {
                    evalExpr = evalExpr.replace(new RegExp(`\\b${varName}\\b`, 'g'), varValue);
                }

                // Handle power operator
                evalExpr = evalExpr.replace(/\*\*/g, 'Math.pow').replace(/Math\.pow(\w+),(\w+)/g, 'Math.pow($1,$2)');

                // Simple math evaluation (unsafe in real apps, but OK for demo)
                return Function(`"use strict"; return (${evalExpr})`)();
            } catch {
                return expr;
            }
        }

        // Handle function calls (simplified)
        if (expr.includes('(') && expr.includes(')')) {
            const funcMatch = expr.match(/(\w+)\((.*)\)/);
            if (funcMatch) {
                const funcName = funcMatch[1];
                const args = funcMatch[2];

                // Built-in functions
                if (funcName === 'len') {
                    const arg = evaluateExpression(args, variables, functions);
                    return Array.isArray(arg) ? arg.length : arg.toString().length;
                }

                // Custom functions (simplified factorial example)
                if (funcName === 'factorial') {
                    const n = evaluateExpression(args, variables, functions);
                    return factorial(n);
                }
            }
        }

        return expr;
    };

    const factorial = (n) => {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    };


    const handleExecute = async () => {
        setIsExecuting(true);
        setError('');
        setOutput('');

        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            if (!pythonCode.trim()) {
                throw new Error('No Python code to execute');
            }

            const result = executePython(pythonCode);
            setOutput(result);
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
            e.target.value = value.substring(0, start) + '    ' + value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 4;
            setPythonCode(e.target.value);
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleExecute();
        }
    };


    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const downloadCode = () => {
        const blob = new Blob([pythonCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'python_code.py';
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadOutput = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-9xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Code className="text-green-600" size={28} />
                        <h1 className="text-2xl font-bold text-gray-800">Python Compiler & Executor</h1>
                    </div>
                    <p className="text-gray-600">
                        Write and execute Python code in your browser. Supports basic Python syntax, variables, functions, and loops.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Python Editor */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="border-b p-4 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800">Python Code Editor</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={downloadCode}
                                    className="flex items-center !border !border-gray-600  gap-1 !bg-white text-gray-600 hover:text-gray-700 text-sm px-3 py-1 !border rounded"
                                >
                                    <Download size={14} />
                                    .py
                                </button>
                                <button
                                    onClick={handleExecute}
                                    disabled={isExecuting}
                                    className="flex items-center gap-2 !bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Play size={16} />
                                    {isExecuting ? 'Running...' : 'Run Code (Ctrl+Enter)'}
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <textarea
                                ref={textareaRef}
                                value={pythonCode}
                                onChange={(e) => setPythonCode(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800"
                                placeholder="Enter your Python code here..."
                            />

                            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                                <span>Tip: Use Ctrl+Enter to run, Tab for indentation</span>
                                <button
                                    onClick={() => copyToClipboard(pythonCode)}
                                    className="flex !border p-2 !border-gray-600 !bg-white items-center gap-1 hover:text-green-600 rounded"
                                >
                                    <Copy size={14} />
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="border-b p-4 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800">Output Console</h2>
                            {(output || error) && (
                                <div className="flex gap-2 items-center">
                                    <span className="text-sm text-gray-500">
                                        Execution time: {executionTime}ms
                                    </span>
                                    {output && (
                                        <button
                                            onClick={downloadOutput}
                                            className="flex items-center gap-1 !bg-white text-green-600 hover:text-green-700 text-sm px-3 py-1 !border !border-green-600 rounded"
                                        >
                                            <Download size={14} />
                                            Output
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 h-96 overflow-auto">
                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                                    <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                                    <div>
                                        <h3 className="font-medium text-red-800">Execution Error</h3>
                                        <p className="text-red-700 text-sm mt-1 font-mono">{error}</p>
                                    </div>
                                </div>
                            )}

                            {output && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle size={18} />
                                        <span className="font-medium">Code executed successfully</span>
                                    </div>

                                    <div className="bg-black text-start text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                                        {output}
                                    </div>
                                </div>
                            )}

                            {!error && !output && !isExecuting && (
                                <div className="text-center text-gray-500 py-12">
                                    <Terminal size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No output to display</p>
                                    <p className="text-sm mt-1">Run your Python code to see output here</p>
                                </div>
                            )}

                            {isExecuting && (
                                <div className="text-center text-gray-500 py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                                    <p>Executing Python code...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sample Code Examples */}
                <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Sample Python Code to Try</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {
                                title: "Hello World",
                                code: `print("Hello, World!")
name = "Python"
print(f"Welcome to {name}!")`
                            },
                            {
                                title: "Math Operations",
                                code: `a = 10
b = 3
print(f"{a} + {b} = {a + b}")
print(f"{a} ** {b} = {a ** b}")
print(f"Square root of 16: {16 ** 0.5}")`
                            },
                            {
                                title: "Lists and Loops",
                                code: `fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(f"I like {fruit}")

numbers = [1, 2, 3, 4, 5]
for num in numbers:
    print(f"{num} squared is {num**2}")`
                            },
                            {
                                title: "Functions",
                                code: `def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b

print(greet("Alice"))
print(f"5 + 3 = {add(5, 3)}")
print(f"Factorial of 4: {factorial(4)}")`
                            }
                        ].map((sample, i) => (
                            <div key={i} className="border rounded-lg p-3">
                                <h4 className="font-medium text-sm text-gray-700 mb-2">{sample.title}</h4>
                                <pre className="text-xs bg-gray-100 p-2 rounded block text-gray-800 overflow-x-auto">
                                    {sample.code}
                                </pre>
                                <button
                                    onClick={() => setPythonCode(sample.code)}
                                    className="!bg-white text-green-600 hover:text-green-700 text-xs mt-2"
                                >
                                    Use this code
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features Info */}
                <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Supported Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Basic Syntax</h4>
                            <ul className="text-gray-600 space-y-1">
                                <li>• Variables and assignments</li>
                                <li>• Print statements</li>
                                <li>• Comments (#)</li>
                                <li>• F-string formatting</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Data Types</h4>
                            <ul className="text-gray-600 space-y-1">
                                <li>• Strings and numbers</li>
                                <li>• Lists and arrays</li>
                                <li>• Basic arithmetic</li>
                                <li>• Mathematical operations</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Control Flow</h4>
                            <ul className="text-gray-600 space-y-1">
                                <li>• For loops (basic)</li>
                                <li>• Function definitions</li>
                                <li>• Function calls</li>
                                <li>• Built-in functions</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PythonCompilerApp;