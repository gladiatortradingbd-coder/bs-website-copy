import mdiAccount from "@iconify/icons-mdi/account";
import mdiGoogle from "@iconify/icons-mdi/google";
import mdiEyeOffOutline from "@iconify/icons-mdi/eye-off-outline";
import mdiEyeOutline from "@iconify/icons-mdi/eye-outline";
import mdiChevronRight from "@iconify/icons-mdi/chevron-right";
import mdiLogout from "@iconify/icons-mdi/logout";
import mdiTrashCanOutline from "@iconify/icons-mdi/trash-can-outline";
import mdiFacebook from "@iconify/icons-mdi/facebook";
import mdiTwitter from "@iconify/icons-mdi/twitter";
import mdiInstagram from "@iconify/icons-mdi/instagram";
import mdiLinkedin from "@iconify/icons-mdi/linkedin";
import mdiDotsVertical from "@iconify/icons-mdi/dots-vertical";
import mdiPostLamp from "@iconify/icons-mdi/post-lamp";
import mdiWhatsapp from "@iconify/icons-mdi/whatsapp";
import mdiFacebookMessenger from "@iconify/icons-mdi/facebook-messenger";
import mdiPhone from "@iconify/icons-mdi/phone";

import solarWidget5Bold from "@iconify/icons-solar/widget-5-bold";
import solarLeafBold from "@iconify/icons-solar/leaf-bold";
import solarHeartOutline from "@iconify/icons-solar/heart-outline";
import solarChatRoundOutline from "@iconify/icons-solar/chat-round-outline";
import solarPlainOutline from "@iconify/icons-solar/plain-outline";
import solarBookmarkOutline from "@iconify/icons-solar/bookmark-outline";
import solarBoxBold from "@iconify/icons-solar/box-bold";
import solarShieldCheckBold from "@iconify/icons-solar/shield-check-bold";
import solarArrowRightLinear from "@iconify/icons-solar/arrow-right-linear";
import solarStarBold from "@iconify/icons-solar/star-bold";
import solarMedalStarBold from "@iconify/icons-solar/medal-star-bold";

import phPottedPlantFill from "@iconify/icons-ph/potted-plant-fill";

import lucideArrowRight from "@iconify/icons-lucide/arrow-right";
import lucideFacebook from "@iconify/icons-lucide/facebook";
import lucideTwitter from "@iconify/icons-lucide/twitter";
import lucideInstagram from "@iconify/icons-lucide/instagram";
import lucideLinkedin from "@iconify/icons-lucide/linkedin";
import lucideLeaf from "@iconify/icons-lucide/leaf";
import lucideShieldCheck from "@iconify/icons-lucide/shield-check";
import lucideHeart from "@iconify/icons-lucide/heart";
import lucideHammer from "@iconify/icons-lucide/hammer";
import lucideLayoutGrid from "@iconify/icons-lucide/layout-grid";
import lucideAward from "@iconify/icons-lucide/award";
import lucideSprout from "@iconify/icons-lucide/sprout";

const iconRegistry = {
  "mdi:account": mdiAccount,
  "mdi:google": mdiGoogle,
  "mdi:eye-off-outline": mdiEyeOffOutline,
  "mdi:eye-outline": mdiEyeOutline,
  "mdi:chevron-right": mdiChevronRight,
  "mdi:logout": mdiLogout,
  "mdi:trash-can-outline": mdiTrashCanOutline,
  "mdi:facebook": mdiFacebook,
  "mdi:twitter": mdiTwitter,
  "mdi:instagram": mdiInstagram,
  "mdi:linkedin": mdiLinkedin,
  "mdi:dots-vertical": mdiDotsVertical,
  "mdi:post-lamp": mdiPostLamp,
  "mdi:whatsapp": mdiWhatsapp,
  "mdi:facebook-messenger": mdiFacebookMessenger,
  "mdi:phone": mdiPhone,
  "solar:widget-5-bold": solarWidget5Bold,
  "solar:leaf-bold": solarLeafBold,
  "solar:heart-outline": solarHeartOutline,
  "solar:chat-round-outline": solarChatRoundOutline,
  "solar:plain-outline": solarPlainOutline,
  "solar:bookmark-outline": solarBookmarkOutline,
  "solar:box-bold": solarBoxBold,
  "solar:shield-check-bold": solarShieldCheckBold,
  "solar:arrow-right-linear": solarArrowRightLinear,
  "solar:star-bold": solarStarBold,
  "solar:medal-star-bold": solarMedalStarBold,
  "hugeicons:soil-moisture-field": lucideSprout,
  "ph:potted-plant-fill": phPottedPlantFill,
  "game-icons:gardening-shears": lucideLeaf,
  "lucide:arrow-right": lucideArrowRight,
  "lucide:facebook": lucideFacebook,
  "lucide:twitter": lucideTwitter,
  "lucide:instagram": lucideInstagram,
  "lucide:linkedin": lucideLinkedin,
  "lucide:leaf": lucideLeaf,
  "lucide:shield-check": lucideShieldCheck,
  "lucide:heart": lucideHeart,
  "lucide:hammer": lucideHammer,
  "lucide:layout-grid": lucideLayoutGrid,
  "lucide:award": lucideAward,
};

export function Icon({ icon, width, height, className = "", title, ...props }) {
  const resolvedIcon = typeof icon === "string" ? iconRegistry[icon] : icon;

  if (!resolvedIcon) {
    return null;
  }

  const resolvedWidth = width ?? resolvedIcon.width ?? 24;
  const resolvedHeight = height ?? resolvedIcon.height ?? 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${resolvedIcon.width ?? 24} ${resolvedIcon.height ?? 24}`}
      width={resolvedWidth}
      height={resolvedHeight}
      className={className}
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: resolvedIcon.body }}
      {...props}
    />
  );
}
