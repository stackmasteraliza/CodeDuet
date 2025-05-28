# CodeDuet 🎵 — SQL + Python Online Compiler in React.js

**CodeDuet** is a dual-language compiler that allows you to write and execute Python and SQL code directly in your browser. It's fast, clean, and built entirely with React.js. Perfect for learning, experimenting, or quickly testing ideas with Python and SQL side by side.

## 🚀 Features

- ⚡ Run **Python** and **SQL** code without a backend
- ✍️ Syntax highlighting using Monaco Editor (VSCode engine)
- 📄 Dual-panel layout for writing both languages independently
- 🧾 Output display for each language
- 💾 Code persists in LocalStorage (no accidental loss)
- 🔁 Clear/reset buttons for individual editors

## 🖼️ Screenshot

![scrnli_1b0vaiQH2sz6jq](https://github.com/user-attachments/assets/697b756f-4dd5-4436-907e-2a799f6e2c23)

![scrnli_qwL6v7fOwszHvL](https://github.com/user-attachments/assets/4301e6fe-f584-4776-a798-e7476d3cd71d)

![scrnli_GILKkFtI2szxcy](https://github.com/user-attachments/assets/531bf697-ecf3-4fd4-87f2-1886a55f4154)


## 🛠 Tech Stack

- **[React.js](https://reactjs.org/)** — Frontend framework for building interactive user interfaces with components and hooks.  
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first CSS framework for rapid and responsive styling.  
- **[lucide-react](https://lucide.dev/)** — Modern SVG icon library for clean, customizable icons.  
- **Clipboard API** — Browser API used to copy SQL queries directly to the clipboard.  
- **Blob API & URL.createObjectURL** — Used to generate downloadable CSV files from query results.  

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:stackmasteraliza/CodeDuet.git
cd CodeDuet
````

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm start
```

Visit `http://localhost:5173` in your browser.

## 📁 Project Structure

```
src/
│
├── screens/
│   ├── python-compiler.jsx       # Python editor component
│   ├── sql-compiler.jsx          # SQL editor component
│
├── App.tsx                    # Main layout
├── index.tsx                  # App entry
```

## 🧪 Language Execution

### Python

Runs directly in the browser using **Skulpt** (or **Pyodide**). No server required.

### SQL

Executes using **sql.js**, an in-browser SQLite engine compiled to WebAssembly.

## ✨ Roadmap / Future Features

* [ ] Shareable code snippets via URL
* [ ] User authentication + saved sessions
* [ ] Export output to CSV
* [ ] Light/dark theme toggle
* [ ] Mobile-friendly layout

## 🙌 Contributing

Contributions, issues and feature requests are welcome!
Feel free to [open an issue](https://github.com/stackmasteraliza/CodeDuet/issues) or submit a pull request.

To contribute:

```bash
# Fork the repo and clone your fork
git clone https://github.com/stackmasteraliza/CodeDuet

# Create a new branch
git checkout -b feature/my-new-feature

# Commit your changes
git commit -m "Add my new feature"

# Push and open a pull request
git push origin feature/my-new-feature
```

## 📜 License

This project is licensed under the MIT License.

---

Made with ❤️ by [Aliza Ali](https://github.com/stackmasteraliza)

```

---

Let me know if you'd like to:
- Add badges (build status, license, etc.)
- Include deploy instructions (e.g., Netlify or Vercel)
- Automatically generate code snippets or database examples

Happy coding!
```
