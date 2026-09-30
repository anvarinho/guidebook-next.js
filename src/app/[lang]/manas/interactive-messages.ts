import type { ManasMessages } from "./translations";

const keys = ["s021", "s031", "s038", "s039", "s042", "s043", "s046", "s047", "s050", "s051", "s057", "s142", "s175", "s197", "s224", "s225", "s231", "s232", "s233", "s255", "s256", "s257", "s258", "s259", "s260", "s261", "s262", "s263", "s264", "s265", "s266", "s267", "s268", "s269", "s270", "s271", "s272", "s273", "s274", "s275", "s276", "s277", "s278", "s279", "s280", "s281", "s282", "s283", "s284", "s286", "s288", "s289", "s290", "s292", "s293", "s294", "s295", "s296", "s297", "s298", "s299", "s300", "s301", "s302", "s303", "s304", "s305", "s306", "s307", "s308", "s309", "s310", "s311", "s312", "s313", "s314", "s315", "s316", "s317", "s318", "s319", "s320", "s321", "s322", "s323", "s324", "s325", "s326", "s327", "s328", "s329", "s330", "s331", "s332", "s333"] as const;

export type InteractiveMessages = Pick<ManasMessages, typeof keys[number]>;

export function interactiveMessages(messages: ManasMessages): InteractiveMessages {
  return Object.fromEntries(keys.map(key => [key, messages[key]])) as InteractiveMessages;
}
