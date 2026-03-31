# Grow (Balloon Pump)

## Introduction / Summary

Grow is an interactive daily engagement app that creates a check-in system with a visual balloon pump mechanic. Users can check in once per day to "pump" a virtual balloon that visually grows through 20 stages until it reaches a configurable goal. The app combines individual user engagement with administrative management capabilities.

## Built With

### Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Server

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)

## Key Features

### User Features

- **Daily Check-In**: Users can check in once per day using the "Help Me Grow!" button
- **Visual Progression**: Balloon grows through 20 visual stages (Pump-0.png through Pump-19.png)
- **Tally Tracking**: Displays overall check-in tally and daily check-in count
- **Goal Tracking**: Shows the current goal required to "pop" the balloon
- **Toast Notifications**: Feedback for successful check-ins, duplicates, and goal completion
- **Particle Effects**: Balloon float particle effects on successful check-ins

### Canvas Elements & Interactions

- **Key Asset**: When clicked, opens the drawer showing the balloon image, current tally, goal, and check-in button

### Admin Features

- **Access**: Click on the key asset to open the drawer and select the Admin gear icon
- **Set Goal**: Change the number of pumps required to pop the balloon
- **Reset**: Clear all check-in data and reset the balloon to its initial state

### Data Objects

The data object attached to the dropped asset stores:

```typescript
{
  dailyCheckIns: {
    "YYYY-MM-DD": {
      total: number,           // Check-ins on that day
      users: {
        [profileId]: timestamp // User's check-in timestamp
      }
    }
  },
  goal: number,               // Target check-ins needed (default: 100)
  overallTally: number,       // Total check-ins in current session
  imageSrc: string            // URL to current balloon image
}
```

## Implementation Requirements

### Required Assets with Unique Names

The app uses the following unique name patterns for managing dropped assets:

| Unique Name Pattern | Description |
| ------------------- | ----------- |
| `Grow_keyAsset`     | Key asset   |

## Environment Variables

Create a `.env` file in the root directory. See `.env-example` for a template.

| Variable                | Description                                                                        | Required |
| ----------------------- | ---------------------------------------------------------------------------------- | -------- |
| `NODE_ENV`              | Node environment                                                                   | No       |
| `SKIP_PREFLIGHT_CHECK`  | Skip CRA preflight check                                                           | No       |
| `AWS_ACCESS_KEY_ID`     | AWS access key ID for S3 access                                                    | Yes      |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key                                                              | Yes      |
| `AWS_SESSION_TOKEN`     | Temporary AWS session token                                                        | No       |
| `S3_BUCKET`             | S3 bucket name for storing grow assets                                             | Yes      |
| `INSTANCE_DOMAIN`       | Topia API domain (`api.topia.io` for production, `api-stage.topia.io` for staging) | Yes      |
| `INTERACTIVE_KEY`       | Topia interactive app key                                                          | Yes      |
| `INTERACTIVE_SECRET`    | Topia interactive app secret                                                       | Yes      |

## Developers

### Getting Started

- Clone this repository
- Run `npm i` in server
- `cd client`
- Run `npm i` in client
- `cd ..` back to server

### Add your .env environmental variables

See [Environment Variables](#environment-variables) above.

### Where to find INTERACTIVE_KEY and INTERACTIVE_SECRET

[Topia Dev Account Dashboard](https://dev.topia.io/t/dashboard/integrations)

[Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
