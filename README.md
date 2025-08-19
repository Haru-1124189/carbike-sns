# CarBike SNS App

車・バイク愛好家のためのSNSアプリケーション

## 環境設定

### Firebase設定

プロジェクトルートに`.env.local`ファイルを作成し、以下のFirebase設定を追加してください：

```env
NEXT_PUBLIC_FB_API_KEY=your_api_key_here
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=your_project_id
NEXT_PUBLIC_FB_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FB_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FB_APP_ID=your_app_id
```

これらの値は[Firebase Console](https://console.firebase.google.com/)のプロジェクト設定から取得できます。

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
