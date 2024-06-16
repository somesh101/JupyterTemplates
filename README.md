# Notebook Template Creator - VS Code Extension

## Description

The Notebook Template Creator is a VS Code extension that allows users to create and manage templates from existing notebooks. This extension aims to streamline the process of reusing notebook structures, saving time and effort. Users can save as many templates as they want with the custom name they provide.
## Features

- **Create Jupyter Template**: Save the structure and content of existing notebooks as templates.
- **Load Templates**: Quickly load saved templates using commands:
 
## Installation

1. Clone this repository to your local machine.
2. Open the project in VS Code.
3. Run `npm install` to install dependencies.
4. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS) and type `Developer: Reload Window` to load the extension.

## Usage

### Save a Template

1. Open a notebook you want to save as a template.
2. Execute the command `Create Jupyter Template` from the command palette.
3. The notebook will be saved as one of the available templates in the extension's folder.

### Load a Template

1. Open the command palette.
2. Execute one of the following commands:
   - `Load Jupyter Template`
    - `Pick the template from list`
3. The selected template will be loaded into the current workspace.

## Upcoming Features

- **Got Any good Idea Let me Know**: 

## Development

### Getting Started

To start developing and contributing to this project:

1. Fork this repository.
2. Clone your forked repository to your local machine.
3. Open the project in VS Code.
4. Install the necessary dependencies by running `npm install`.

### File Structure

- `extension.js`: Source code for the extension.
- `./templates/`: Folder where templates are stored.

### Running the Extension

1. Press `F5` to open a new VS Code window with the extension loaded.
2. Use the commands mentioned above to test the functionality.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork this repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any issues or suggestions, please open an issue on GitHub.

---

Thank you for using Notebook Template Creator! We hope it enhances your productivity.
