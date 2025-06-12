import activityIcon_download from "./activityIcon_download.png";
import activityIcon_firstbonus from "./activityIcon_firstbonus.png";
import activityIcon_prize from "./activityIcon_prize.png";
import activityIcon_safebox from "./activityIcon_safebox.png";
import signInBanner from "./signInBanner.png";
import giftRedeem from "./giftRedeem.png";
import aviator_new_update from "./aviator_new_update.png";
import become_agent_with from "./become_agent_with.png";
import first_recharge_bonus from "./first_recharge_bonus.png";
import support_funds from "./support_funds.png";
import weekly_vip_bonus from "./weekly_vip_bonus.png";
import winstreak_bonus from "./winstreak_bonus.png";
import telegram_channel from "./telegram_channel.png";
import welcome_to_games from "./welcome_to_games.png";
import aviator_new_update_details from "./aviator_new_update_details.png";
import become_agent_with_details from "./become_agent_with_details.png";
import support_funds_details from "./become_agent_with_details.jpg";
import winstreak_bonus_details from "./winstreak_bonus_details.jpg";

export const activityLinks = [
  { image: activityIcon_prize, text: "Text Activity", link_to: "/user-tasks" },
  { image: activityIcon_safebox, text: "Safe", link_to: "/safe-box" },
  {
    image: activityIcon_firstbonus,
    text: "Recharge Bonus",
    link_to: "/promotion/recharge-awards",
  },
  {
    image: activityIcon_download,
    text: "App Download Reward",
    link_to: "/promotion/app-download-rewards",
  },
];

export const gifts_bonus = [
  {
    image: signInBanner,
    title: "Gift",
    content: "Enter the redemption code to receive gift rewards",
    link_to: "/user-redeem-gift",
  },
  {
    image: giftRedeem,
    title: "Attendance Bonus",
    content:
      "The more consecutive days you sign in, the higher the reward will be",
    link_to: "/daily-attendance-reward",
  },
];

export const main_links = [
  {
    image: aviator_new_update,
    title: "Aviator New Update",
    details: aviator_new_update_details,
  },
  { image: first_recharge_bonus, title: "First Recharge Bonus" },
  { image: weekly_vip_bonus, title: "Weekly VIP Bonus" },
  {
    image: become_agent_with,
    title: "Become Agent with",
    details: become_agent_with_details,
  },
  {
    image: support_funds,
    title: "Support Funds 8%",
    details: support_funds_details,
  },
  {
    image: winstreak_bonus,
    title: "WinStreak Bonus",
    details: winstreak_bonus_details,
  },
];

export const carousel_images = [
  {
    image: aviator_new_update,
    title: "Aviator New Update",
    details: aviator_new_update_details,
  },
  { image: welcome_to_games, title: "Welcome to Game" },
  { image: first_recharge_bonus, title: "First Recharge Bonus" },
  { image: telegram_channel, title: "Telegram Channel" },
  { image: weekly_vip_bonus, title: "Weekly VIP Bonus" },
  {
    image: become_agent_with,
    title: "Become Agent with",
    details: become_agent_with_details,
  },
  {
    image: support_funds,
    title: "Support Funds 8%",
    details: support_funds_details,
  },
  {
    image: winstreak_bonus,
    title: "WinStreak Bonus",
    details: winstreak_bonus_details,
  },
];
