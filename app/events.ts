import type { Event } from "../data/normalized/schema";
import mbb from "../data/normalized/mbb.json";
import wbb from "../data/normalized/wbb.json";
import wsc from "../data/normalized/wsc.json";
import bsb from "../data/normalized/bsb.json";
import wsb from "../data/normalized/wsb.json";
import fb from "../data/normalized/fb.json";
import wvb from "../data/normalized/wvb.json";

export const events = [...mbb, ...wbb, ...wsc, ...bsb, ...wsb, ...fb, ...wvb] as Event[];
