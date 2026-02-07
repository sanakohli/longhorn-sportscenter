import type { Event } from "../data/normalized/schema";
import mbb from "../data/normalized/mbb.json";
import wbb from "../data/normalized/wbb.json";
import wsc from "../data/normalized/wsc.json";
import bsb from "../data/normalized/bsb.json";
import wsb from "../data/normalized/wsb.json";
    
export const events = [...mbb, ...wbb, ...wsc, ...bsb, ...wsb] as Event[];