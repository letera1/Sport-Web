# Contributing to Live Football Scores

First off, thank you for considering contributing to Live Football Scores! It's people like you that make this project better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (OS, Node version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other applications** (if applicable)

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Simple issues perfect for beginners
- `help wanted` - Issues that need attention

## 🛠 Development Setup

1. **Fork the repository** and clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/live-football-scores.git
   cd live-football-scores
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔄 Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Follow the coding standards** outlined below
3. **Write meaningful commit messages** (see guidelines below)
4. **Test your changes** thoroughly
5. **Update the README.md** if needed
6. **Ensure your code lints** without errors:
   ```bash
   npm run lint
   ```

7. **Create a Pull Request** with a clear title and description:
   - Reference any related issues
   - Describe what changes you made and why
   - Include screenshots for UI changes

### PR Review Process

- At least one maintainer must review and approve your PR
- Address any requested changes promptly
- Once approved, a maintainer will merge your PR

## 💻 Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types/interfaces (avoid `any`)
- Use meaningful variable and function names

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design patterns
- Ensure responsive design (mobile-first)
- Maintain dark theme consistency

### File Organization

```
src/
├── components/    # Reusable UI components
├── pages/         # Page-level components
├── hooks/         # Custom React hooks
├── services/      # API and external services
├── lib/           # Utility functions
├── types.ts       # Shared TypeScript types
└── constants.ts   # App-wide constants
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Run `npm run lint` before committing

## 📝 Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(dashboard): add date picker for match filtering

fix(match-details): resolve lineup display issue

docs(readme): update installation instructions

style(components): format code with prettier

refactor(hooks): optimize useMatches hook performance
```

## 🧪 Testing

- Test your changes in multiple browsers
- Verify responsive design on different screen sizes
- Check that live updates work correctly
- Ensure no console errors or warnings

## 📞 Questions?

Feel free to open an issue with the `question` label if you need help or clarification.

---

Thank you for contributing! 🎉
