import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { LicenseManager, LicenseStatus } from './license';

interface PluginSettings {
    nextcloudUrl: string;
    username: string;
    licenseKey: string;
    signedToken: string | null;
    tokenExpiresAt: number | null;
}

const DEFAULT_SETTINGS: PluginSettings = {
    nextcloudUrl: '',
    username: '',
    licenseKey: '',
    signedToken: null,
    tokenExpiresAt: null
}

export default class NextcloudMediaPlugin extends Plugin {
    settings: PluginSettings;

    async onload() {
        await this.loadSettings();

        // Register Settings Tab
        this.addSettingTab(new PremiumSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class PremiumSettingTab extends PluginSettingTab {
    plugin: NextcloudMediaPlugin;

    constructor(app: App, plugin: NextcloudMediaPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async display(): Promise<void> {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Nextcloud Media Settings' });

        // Connection Section
        new Setting(containerEl)
            .setName('Nextcloud URL')
            .setDesc('Your Nextcloud instance URL')
            .addText(text => text
                .setPlaceholder('https://cloud.example.com')
                .setValue(this.plugin.settings.nextcloudUrl)
                .onChange(async (value) => {
                    this.plugin.settings.nextcloudUrl = value;
                    await this.plugin.saveSettings();
                }));

        // Premium Section
        containerEl.createEl('h3', { text: 'Premium License' });

        // License Status Check
        const status = await LicenseManager.getStatus(this.plugin.settings.signedToken);
        const statusDiv = containerEl.createDiv();
        statusDiv.style.marginBottom = '1rem';
        statusDiv.style.padding = '0.5rem';
        statusDiv.style.borderRadius = '4px';
        statusDiv.style.fontWeight = 'bold';
        statusDiv.style.textAlign = 'center';

        // Helper for Status Colors
        const setStatusStyle = (bgColor: string, text: string) => {
            statusDiv.style.backgroundColor = bgColor;
            statusDiv.style.color = '#fff';
            statusDiv.setText(`Status: ${text}`);
        };

        switch (status) {
            case LicenseStatus.Active:
                setStatusStyle('#3d8b40', 'Active (Premium Unlocked)'); // Success Green
                break;
            case LicenseStatus.GracePeriod:
                setStatusStyle('#e0ac00', 'Grace Period (Please reconnect soon)'); // Warning Yellow
                break;
            case LicenseStatus.Expired:
                setStatusStyle('#d43d3d', 'Expired'); // Error Red
                break;
            default:
                setStatusStyle('#333', 'Unlicensed (Free Tier)'); // Default Dark
        }

        new Setting(containerEl)
            .setName('License Key')
            .setDesc('Enter your premium license key')
            .addText(text => text
                .setPlaceholder('LICENSE-KEY-...')
                .setValue(this.plugin.settings.licenseKey)
                .onChange(async (value) => {
                    this.plugin.settings.licenseKey = value;
                    await this.plugin.saveSettings();
                }));

        const activateBtn = new Setting(containerEl)
            .addButton(btn => btn
                .setButtonText('Activate License')
                .setCta()
                .onClick(async () => {
                    btn.setButtonText('Activating...');
                    btn.setDisabled(true);
                    try {
                        // Mock Activation Logic (Replace with real API call later)
                        console.log('Activating against backend...');
                        // Simulate API delay
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // TODO: In real implementation, fetch from /api/v1/license/activate
                        // For now, we just log it.
                        console.log('Activation complete (Mock)');
                    } catch (e) {
                        console.error(e);
                    } finally {
                        btn.setButtonText('Activate License');
                        btn.setDisabled(false);
                    }
                }));

        if (status === LicenseStatus.Active) {
            activateBtn.settingEl.style.display = 'none'; // Hide activation if active

            // Show Premium Features controls if active
            containerEl.createEl('h4', { text: 'Pro Features' });
            new Setting(containerEl)
                .setName('10-bit Color Streaming')
                .setDesc('Enable high-fidelity color for video previews.')
                .addToggle(t => t.setValue(true));
        }
    }
}
