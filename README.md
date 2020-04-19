1. Create a Firebase project
2. Create a LINE Channel https://developers.line.biz/

    1. Set some basic settings like name and copy `Channel secret`
  
    2. Messaging API > Issue Channel Access Token
  
    3. Messaging API > Allow bot to join group chats > Enabled
  
3. Set firebase remote config
   ```
   firebase functions:config:set line.channel_access_token="FROM_STEP_2_2" line.channel_secret="FROM_STEP_2_1"
   ```
   
4. firebase deploy --only functions

5. Set callback url in LINE Developers > Messaging API > Webhook settings (`https://us-central1-PROJECT_ID.cloudfunctions.net/api/webhook`)
