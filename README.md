# Meld Studio Plugin for Firebot

This plugin adds support for controlling Meld Studio to [Firebot](https://firebot.app).

## Prerequisites
- Firebot 5.65 or higher

## Setup

1. Copy the `firebot-meld-studio.js` file into your Firebot profile's `scripts` folder (e.g. `%appdata%\Firebot\v5\profiles\Main Profile\scripts`)
2. Go to Settings > Scripts in Firebot
3. Click on "Manage Startup Scripts"
4. Click "Add New Script"
5. Select the `firebot-meld-studio.js` file from the dropdown list
6. If necessary, update the **IP Address** and **Port** parameters
7. Click "Save"

## Effects

New effects:
- **Meld Studio: Start Streaming**
- **Meld Studio: Stop Streaming**
- **Meld Studio: Start Recording**
- **Meld Studio: Stop Recording**
- **Meld Studio: Show Scene**
- **Meld Studio: Stage Scene**
- **Meld Studio: Show Staged Scene**
- **Meld Studio: Record Clip**
- **Meld Studio: Take Screenshot**
- **Meld Studio: Show Replay**
- **Meld Studio: Dismiss Replay**
- **Meld Studio: Toggle Layer Visibility**
- **Meld Studio: Toggle Track Mute**
- **Meld Studio: Toggle Virtual Camera**

## Events

New events:
- **Meld Studio: Connected**
- **Meld Studio: Disconnected**
- **Meld Studio: Streaming Started**
- **Meld Studio: Streaming Stopped**
- **Meld Studio: Recording Started**
- **Meld Studio: Recording Stopped**
- **Meld Studio: Scene Changed**
- **Meld Studio: Staged Scene Changed**
- **Meld Studio: Track Muted**
- **Meld Studio: Track Unmuted**
- **Meld Studio: Track Volume Changed**

## Event Filters

New filters:
- **Meld Studio Scene Name**
- **Meld Studio Track Name**

## Variables

New variables:
- `$meldIsConnected`
- `$meldIsRecording`
- `$meldIsStreaming`
- `$meldSceneId`
- `$meldSceneName`
- `$meldStagedSceneId`
- `$meldStagedSceneName`
- `$meldTrackId`
- `$meldTrackName`
- `$meldTrackVolume`