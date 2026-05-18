# Contributing

Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](LICENSE).

Everyone is welcome to contribute to this project. Contributing doesn't just mean submitting pull requests—there are many different ways for you to get involved, including answering questions, reporting issues, improving documentation, or suggesting new features.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists in the [GitHub Issues](https://github.com/orassayag/crawler/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Your environment details (OS, Node version, MongoDB version)

### Submitting Pull Requests

1. Fork the repository
2. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following the code style guidelines below
4. Test your changes thoroughly
5. Commit with clear, descriptive messages
6. Push to your fork and submit a pull request

### Code Style Guidelines

This project uses:

- **JavaScript (Node.js)** with ES6+ features
- **ESLint** for code quality

Before submitting:

```bash
# Install dependencies
npm install

# Test the application
npm start

# Run specific tests
npm run val
npm run link
```

### Coding Standards

1. **Functions with 3+ parameters**: Use object parameters for better readability
2. **Error handling**: Proper try-catch blocks with meaningful error messages
3. **Comments**: Add comments to explain complex logic
4. **Naming**: Use clear, descriptive names for variables and functions
5. **Validation**: All external data must be validated before use
6. **Modular code**: Keep files focused and functions small

### Adding New Features

When adding new features:

1. Update settings in `src/settings/settings.js` if needed
2. Add service logic in `src/services/`
3. Update configurations in `src/configurations/` if needed
4. Add models in `src/core/models/` if needed
5. Test thoroughly in both development and production modes

### Search Engine Integration

When adding new search engines to `src/configurations/files/searchEngines.configuration.js`:

1. Test the URL structure thoroughly
2. Add appropriate domain filters in `filterLinkDomains.configuration.js`
3. Verify pagination works correctly
4. Document the search engine configuration

### Email Validation Logic

When modifying email validation in `src/services/files/emailAddressValidation.service.js`:

1. Add test cases to demonstrate the validation logic
2. Update typo lists in configurations if needed
3. Ensure backward compatibility with existing data
4. Test with the validation test scripts

## Questions or Need Help?

Please feel free to contact me with any question, comment, pull-request, issue, or any other thing you have in mind.

- Or Assayag <orassayag@gmail.com>
- GitHub: https://github.com/orassayag
- StackOverflow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
- LinkedIn: https://linkedin.com/in/orassayag

Thank you for contributing! 🙏
