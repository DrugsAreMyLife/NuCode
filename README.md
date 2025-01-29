# NuCode

NuCode is a fork of Roo-code that adds enhanced mode system capabilities and automatic updates while maintaining compatibility with the upstream project.

## Features

- **Enhanced Mode System**: Advanced mode transitions and context management
- **Automatic Updates**: Stay in sync with upstream Roo-code through automated PR creation
- **Side-by-Side Installation**: Can be installed alongside Roo-code without conflicts
- **Custom Settings**: Separate configuration space from Roo-code
- **Migration Tools**: Easy migration from existing Roo-code settings

## Installation

1. Install from VS Code Marketplace:
   ```
   ext install your-publisher.nucode
   ```

2. Or build from source:
   ```bash
   git clone https://github.com/your-username/nucode.git
   cd nucode
   npm install
   npm run build
   ```

## Migration from Roo-code

If you're currently using Roo-code and want to migrate your settings:

1. Install NuCode from the marketplace
2. Run the migration script:
   ```bash
   npm run migrate-settings
   ```

The script will:
- Copy your custom modes to NuCode
- Transfer MCP settings
- Update VS Code settings
- Preserve your original Roo-code settings

Your Roo-code installation will remain untouched and can be used side-by-side with NuCode.

## Configuration

NuCode uses its own configuration namespace to avoid conflicts:

```jsonc
{
  "nucode.updateChecker.enabled": true,
  "nucode.updateChecker.interval": "daily",
  "nucode.updateChecker.autoCreatePRs": true
}
```

### Settings Location

- Windows: `%APPDATA%\Code\User\globalStorage\your-publisher.nucode\settings\`
- macOS: `~/Library/Application Support/Code/User/globalStorage/your-publisher.nucode/settings/`
- Linux: `~/.config/Code/User/globalStorage/your-publisher.nucode/settings/`

## Enhanced Mode System

NuCode extends the Roo-code mode system with:

- Automatic mode transitions based on context
- Enhanced file pattern matching
- Mode-specific capabilities
- Seamless handoffs between modes
- Context preservation during transitions

## Staying Updated

NuCode automatically checks for updates from the upstream Roo-code repository:

1. Configure GitHub token:
   ```jsonc
   {
     "nucode.github.token": "your-github-token"
   }
   ```

2. Enable automatic updates:
   ```jsonc
   {
     "nucode.updateChecker.enabled": true,
     "nucode.updateChecker.interval": "daily"
   }
   ```

3. Monitor updates in the NuCode sidebar or run:
   ```
   > NuCode: Check for Updates
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the same terms as Roo-code - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Based on [Roo-code](https://github.com/rooveterinaryinc/roo-code)
- All original features and functionality are preserved
- Enhancements build upon the solid foundation of Roo-code

## Relationship with Roo-code

NuCode is a fork that:
- Maintains compatibility with upstream
- Adds new features without breaking existing ones
- Can be installed alongside Roo-code
- Automatically incorporates upstream improvements
- Uses separate configuration space

## Support

- File issues on [GitHub](https://github.com/your-username/nucode/issues)
- Join discussions in [Discussions](https://github.com/your-username/nucode/discussions)
- Read the [documentation](docs/)
