"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const obsidian_1 = require("obsidian");
const license_1 = require("./license");
const DEFAULT_SETTINGS = {
    nextcloudUrl: '',
    username: '',
    licenseKey: '',
    signedToken: null,
    tokenExpiresAt: null
};
class NextcloudMediaPlugin extends obsidian_1.Plugin {
    onload() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            // Register Settings Tab
            this.addSettingTab(new PremiumSettingTab(this.app, this));
        });
    }
    loadSettings() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
}
exports.default = NextcloudMediaPlugin;
class PremiumSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { containerEl } = this;
            containerEl.empty();
            containerEl.createEl('h2', { text: 'Nextcloud Media Settings' });
            // Connection Section
            new obsidian_1.Setting(containerEl)
                .setName('Nextcloud URL')
                .setDesc('Your Nextcloud instance URL')
                .addText(text => text
                .setPlaceholder('https://cloud.example.com')
                .setValue(this.plugin.settings.nextcloudUrl)
                .onChange((value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.nextcloudUrl = value;
                yield this.plugin.saveSettings();
            })));
            // Premium Section
            containerEl.createEl('h3', { text: 'Premium License' });
            // License Status Check
            const status = yield license_1.LicenseManager.getStatus(this.plugin.settings.signedToken);
            const statusDiv = containerEl.createDiv();
            statusDiv.style.marginBottom = '1rem';
            statusDiv.style.padding = '0.5rem';
            statusDiv.style.borderRadius = '4px';
            statusDiv.style.fontWeight = 'bold';
            statusDiv.style.textAlign = 'center';
            // Helper for Status Colors
            const setStatusStyle = (bgColor, text) => {
                statusDiv.style.backgroundColor = bgColor;
                statusDiv.style.color = '#fff';
                statusDiv.setText(`Status: ${text}`);
            };
            switch (status) {
                case license_1.LicenseStatus.Active:
                    setStatusStyle('#3d8b40', 'Active (Premium Unlocked)'); // Success Green
                    break;
                case license_1.LicenseStatus.GracePeriod:
                    setStatusStyle('#e0ac00', 'Grace Period (Please reconnect soon)'); // Warning Yellow
                    break;
                case license_1.LicenseStatus.Expired:
                    setStatusStyle('#d43d3d', 'Expired'); // Error Red
                    break;
                default:
                    setStatusStyle('#333', 'Unlicensed (Free Tier)'); // Default Dark
            }
            new obsidian_1.Setting(containerEl)
                .setName('License Key')
                .setDesc('Enter your premium license key')
                .addText(text => text
                .setPlaceholder('LICENSE-KEY-...')
                .setValue(this.plugin.settings.licenseKey)
                .onChange((value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.licenseKey = value;
                yield this.plugin.saveSettings();
            })));
            const activateBtn = new obsidian_1.Setting(containerEl)
                .addButton(btn => btn
                .setButtonText('Activate License')
                .setCta()
                .onClick(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                btn.setButtonText('Activating...');
                btn.setDisabled(true);
                try {
                    // Mock Activation Logic (Replace with real API call later)
                    console.log('Activating against backend...');
                    // Simulate API delay
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                    // TODO: In real implementation, fetch from /api/v1/license/activate
                    // For now, we just log it.
                    console.log('Activation complete (Mock)');
                }
                catch (e) {
                    console.error(e);
                }
                finally {
                    btn.setButtonText('Activate License');
                    btn.setDisabled(false);
                }
            })));
            if (status === license_1.LicenseStatus.Active) {
                activateBtn.settingEl.style.display = 'none'; // Hide activation if active
                // Show Premium Features controls if active
                containerEl.createEl('h4', { text: 'Pro Features' });
                new obsidian_1.Setting(containerEl)
                    .setName('10-bit Color Streaming')
                    .setDesc('Enable high-fidelity color for video previews.')
                    .addToggle(t => t.setValue(true));
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQWtFO0FBQ2xFLHVDQUEwRDtBQVUxRCxNQUFNLGdCQUFnQixHQUFtQjtJQUNyQyxZQUFZLEVBQUUsRUFBRTtJQUNoQixRQUFRLEVBQUUsRUFBRTtJQUNaLFVBQVUsRUFBRSxFQUFFO0lBQ2QsV0FBVyxFQUFFLElBQUk7SUFDakIsY0FBYyxFQUFFLElBQUk7Q0FDdkIsQ0FBQTtBQUVELE1BQXFCLG9CQUFxQixTQUFRLGlCQUFNO0lBRzlDLE1BQU07O1lBQ1IsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFMUIsd0JBQXdCO1lBQ3hCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUQsQ0FBQztLQUFBO0lBRUssWUFBWTs7WUFDZCxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDL0UsQ0FBQztLQUFBO0lBRUssWUFBWTs7WUFDZCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7S0FBQTtDQUNKO0FBakJELHVDQWlCQztBQUVELE1BQU0saUJBQWtCLFNBQVEsMkJBQWdCO0lBRzVDLFlBQVksR0FBUSxFQUFFLE1BQTRCO1FBQzlDLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVLLE9BQU87O1lBQ1QsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQztZQUM3QixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7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QyxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsNEJBQTRCO2dCQUUxRSwyQ0FBMkM7Z0JBQzNDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7Z0JBQ3JELElBQUksa0JBQU8sQ0FBQyxXQUFXLENBQUM7cUJBQ25CLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztxQkFDakMsT0FBTyxDQUFDLGdEQUFnRCxDQUFDO3FCQUN6RCxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDMUMsQ0FBQztRQUNMLENBQUM7S0FBQTtDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwLCBQbHVnaW4sIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XHJcbmltcG9ydCB7IExpY2Vuc2VNYW5hZ2VyLCBMaWNlbnNlU3RhdHVzIH0gZnJvbSAnLi9saWNlbnNlJztcclxuXHJcbmludGVyZmFjZSBQbHVnaW5TZXR0aW5ncyB7XHJcbiAgICBuZXh0Y2xvdWRVcmw6IHN0cmluZztcclxuICAgIHVzZXJuYW1lOiBzdHJpbmc7XHJcbiAgICBsaWNlbnNlS2V5OiBzdHJpbmc7XHJcbiAgICBzaWduZWRUb2tlbjogc3RyaW5nIHwgbnVsbDtcclxuICAgIHRva2VuRXhwaXJlc0F0OiBudW1iZXIgfCBudWxsO1xyXG59XHJcblxyXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBQbHVnaW5TZXR0aW5ncyA9IHtcclxuICAgIG5leHRjbG91ZFVybDogJycsXHJcbiAgICB1c2VybmFtZTogJycsXHJcbiAgICBsaWNlbnNlS2V5OiAnJyxcclxuICAgIHNpZ25lZFRva2VuOiBudWxsLFxyXG4gICAgdG9rZW5FeHBpcmVzQXQ6IG51bGxcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTmV4dGNsb3VkTWVkaWFQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xyXG4gICAgc2V0dGluZ3M6IFBsdWdpblNldHRpbmdzO1xyXG5cclxuICAgIGFzeW5jIG9ubG9hZCgpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xyXG5cclxuICAgICAgICAvLyBSZWdpc3RlciBTZXR0aW5ncyBUYWJcclxuICAgICAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFByZW1pdW1TZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbG9hZFNldHRpbmdzKCkge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHNhdmVTZXR0aW5ncygpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBQcmVtaXVtU2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xyXG4gICAgcGx1Z2luOiBOZXh0Y2xvdWRNZWRpYVBsdWdpbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBOZXh0Y2xvdWRNZWRpYVBsdWdpbikge1xyXG4gICAgICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcclxuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBkaXNwbGF5KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XHJcbiAgICAgICAgY29udGFpbmVyRWwuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnTmV4dGNsb3VkIE1lZGlhIFNldHRpbmdzJyB9KTtcclxuXHJcbiAgICAgICAgLy8gQ29ubmVjdGlvbiBTZWN0aW9uXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKCdOZXh0Y2xvdWQgVVJMJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ1lvdXIgTmV4dGNsb3VkIGluc3RhbmNlIFVSTCcpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdodHRwczovL2Nsb3VkLmV4YW1wbGUuY29tJylcclxuICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5uZXh0Y2xvdWRVcmwpXHJcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubmV4dGNsb3VkVXJsID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIC8vIFByZW1pdW0gU2VjdGlvblxyXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1ByZW1pdW0gTGljZW5zZScgfSk7XHJcblxyXG4gICAgICAgIC8vIExpY2Vuc2UgU3RhdHVzIENoZWNrXHJcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gYXdhaXQgTGljZW5zZU1hbmFnZXIuZ2V0U3RhdHVzKHRoaXMucGx1Z2luLnNldHRpbmdzLnNpZ25lZFRva2VuKTtcclxuICAgICAgICBjb25zdCBzdGF0dXNEaXYgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoKTtcclxuICAgICAgICBzdGF0dXNEaXYuc3R5bGUubWFyZ2luQm90dG9tID0gJzFyZW0nO1xyXG4gICAgICAgIHN0YXR1c0Rpdi5zdHlsZS5wYWRkaW5nID0gJzAuNXJlbSc7XHJcbiAgICAgICAgc3RhdHVzRGl2LnN0eWxlLmJvcmRlclJhZGl1cyA9ICc0cHgnO1xyXG4gICAgICAgIHN0YXR1c0Rpdi5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgICAgIHN0YXR1c0Rpdi5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuXHJcbiAgICAgICAgLy8gSGVscGVyIGZvciBTdGF0dXMgQ29sb3JzXHJcbiAgICAgICAgY29uc3Qgc2V0U3RhdHVzU3R5bGUgPSAoYmdDb2xvcjogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgc3RhdHVzRGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGJnQ29sb3I7XHJcbiAgICAgICAgICAgIHN0YXR1c0Rpdi5zdHlsZS5jb2xvciA9ICcjZmZmJztcclxuICAgICAgICAgICAgc3RhdHVzRGl2LnNldFRleHQoYFN0YXR1czogJHt0ZXh0fWApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHN3aXRjaCAoc3RhdHVzKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTGljZW5zZVN0YXR1cy5BY3RpdmU6XHJcbiAgICAgICAgICAgICAgICBzZXRTdGF0dXNTdHlsZSgnIzNkOGI0MCcsICdBY3RpdmUgKFByZW1pdW0gVW5sb2NrZWQpJyk7IC8vIFN1Y2Nlc3MgR3JlZW5cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExpY2Vuc2VTdGF0dXMuR3JhY2VQZXJpb2Q6XHJcbiAgICAgICAgICAgICAgICBzZXRTdGF0dXNTdHlsZSgnI2UwYWMwMCcsICdHcmFjZSBQZXJpb2QgKFBsZWFzZSByZWNvbm5lY3Qgc29vbiknKTsgLy8gV2FybmluZyBZZWxsb3dcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIExpY2Vuc2VTdGF0dXMuRXhwaXJlZDpcclxuICAgICAgICAgICAgICAgIHNldFN0YXR1c1N0eWxlKCcjZDQzZDNkJywgJ0V4cGlyZWQnKTsgLy8gRXJyb3IgUmVkXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHNldFN0YXR1c1N0eWxlKCcjMzMzJywgJ1VubGljZW5zZWQgKEZyZWUgVGllciknKTsgLy8gRGVmYXVsdCBEYXJrXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoJ0xpY2Vuc2UgS2V5JylcclxuICAgICAgICAgICAgLnNldERlc2MoJ0VudGVyIHlvdXIgcHJlbWl1bSBsaWNlbnNlIGtleScpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdMSUNFTlNFLUtFWS0uLi4nKVxyXG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmxpY2Vuc2VLZXkpXHJcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubGljZW5zZUtleSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICBjb25zdCBhY3RpdmF0ZUJ0biA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuYWRkQnV0dG9uKGJ0biA9PiBidG5cclxuICAgICAgICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdBY3RpdmF0ZSBMaWNlbnNlJylcclxuICAgICAgICAgICAgICAgIC5zZXRDdGEoKVxyXG4gICAgICAgICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bi5zZXRCdXR0b25UZXh0KCdBY3RpdmF0aW5nLi4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLnNldERpc2FibGVkKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1vY2sgQWN0aXZhdGlvbiBMb2dpYyAoUmVwbGFjZSB3aXRoIHJlYWwgQVBJIGNhbGwgbGF0ZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBY3RpdmF0aW5nIGFnYWluc3QgYmFja2VuZC4uLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW11bGF0ZSBBUEkgZGVsYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDApKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IEluIHJlYWwgaW1wbGVtZW50YXRpb24sIGZldGNoIGZyb20gL2FwaS92MS9saWNlbnNlL2FjdGl2YXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBub3csIHdlIGp1c3QgbG9nIGl0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQWN0aXZhdGlvbiBjb21wbGV0ZSAoTW9jayknKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnRuLnNldEJ1dHRvblRleHQoJ0FjdGl2YXRlIExpY2Vuc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnRuLnNldERpc2FibGVkKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIGlmIChzdGF0dXMgPT09IExpY2Vuc2VTdGF0dXMuQWN0aXZlKSB7XHJcbiAgICAgICAgICAgIGFjdGl2YXRlQnRuLnNldHRpbmdFbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyAvLyBIaWRlIGFjdGl2YXRpb24gaWYgYWN0aXZlXHJcblxyXG4gICAgICAgICAgICAvLyBTaG93IFByZW1pdW0gRmVhdHVyZXMgY29udHJvbHMgaWYgYWN0aXZlXHJcbiAgICAgICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoNCcsIHsgdGV4dDogJ1BybyBGZWF0dXJlcycgfSk7XHJcbiAgICAgICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAgICAgLnNldE5hbWUoJzEwLWJpdCBDb2xvciBTdHJlYW1pbmcnKVxyXG4gICAgICAgICAgICAgICAgLnNldERlc2MoJ0VuYWJsZSBoaWdoLWZpZGVsaXR5IGNvbG9yIGZvciB2aWRlbyBwcmV2aWV3cy4nKVxyXG4gICAgICAgICAgICAgICAgLmFkZFRvZ2dsZSh0ID0+IHQuc2V0VmFsdWUodHJ1ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=