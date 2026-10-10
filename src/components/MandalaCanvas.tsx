import { useCallback, useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/translations";
import { compassMandalaLayout } from "@/lib/art-geometry";
import { DEFAULT_TRAITS, ELEMENT_AURA, mandalaTraitLabels, symmetryPetals, type MandalaTraits } from "@/lib/mandala-traits";
import { artSpecialistCopy } from "@/lib/art-specialist-copy";
import mandalaBase from "@/assets/mandala-base-vivid.jpg";

export type MandalaColor = { name: string; code: string };
export type Capture = () => Promise<{ blob: Blob; width: number; height: number }>;
type Props = { colors: MandalaColor[]; language: Language; variation: number; reduced: boolean; traits?: MandalaTraits; onCapture: (capture: Capture | null) => void };

const OUT = 2048;
const BASE_IMAGE = mandalaBase;

const readHex = (hex: string) => {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map(char => char + char).join("") : value.padEnd(6, "0");
  return [0, 2, 4].map(offset => parseInt(full.slice(offset, offset + 2), 16) || 0);
};

const mixHex = (hex: string, target: string, amount: number) => {
  const source = readHex(hex);
  const destination = readHex(target);
  return `#${source.map((channel, index) => Math.round(channel + ((destination[index] ?? 0) - channel) * amount).toString(16).padStart(2, "0")).join("")}`;
};

export function birthColorTones(hex: string) {
  return { highlight: mixHex(hex, "#FFFFFF", .32), base: hex, shadow: mixHex(hex, "#000000", .3) };
}

/** Builds the dynamic seven-color plate used for both live display and export. */
export function buildMandalaColorPlate(codes: string[], variation: number, _animated: boolean, traits: MandalaTraits = DEFAULT_TRAITS) {
  // Visual hierarchy: overall gemstone, then health → love → work → wealth.
  // Sub and mind remain as restrained bridge colors in the two outer layers.
  const visualCodes = [codes[0], codes[5], codes[4], codes[3], codes[2], codes[1], codes[6]].filter((code): code is string => Boolean(code));
  const { core, compassR, layers, particles, workSeed } = compassMandalaLayout(visualCodes, variation, 480, symmetryPetals(traits.symmetry));
  const unit = (salt: number) => {
    const x = Math.sin((workSeed + salt) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const textureDefs = layers.map((l, i) => {
    const tones = birthColorTones(l.color);
    const angle = 116 + i * 17;
    const x = Math.cos(angle * Math.PI / 180) * 512;
    const y = Math.sin(angle * Math.PI / 180) * 512;
    return `<linearGradient id="birthGradient${i}" gradientUnits="userSpaceOnUse" x1="-360" y1="-360" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"><stop offset="0" stop-color="${tones.highlight}"/><stop offset=".48" stop-color="${tones.base}"/><stop offset="1" stop-color="${tones.shadow}"/></linearGradient><clipPath id="motifClip${i}">${l.segments.map(segment => `<path d="${segment.path}"/>`).join("")}${l.innerSegments.map(segment => `<path d="${segment.path}"/>`).join("")}${l.facetSegments.map(segment => `<path d="${segment.path}"/>`).join("")}</clipPath><filter id="pigment${i}" x="-18%" y="-18%" width="136%" height="136%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${(.009 + unit(100 + i) * .006).toFixed(4)}" numOctaves="4" seed="${(workSeed + i * 17) % 997}" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="${(7 + unit(120 + i) * 7).toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  }).join("");
  const colorLayers: string[] = [];
  const shadowLayers: string[] = [];
  const goldLayers: string[] = [];
  layers.slice().reverse().forEach((l, ri) => {
    const i = layers.length - 1 - ri;
    const supportive = i >= 4;
    const role = i === 0 ? "health" : i === 1 ? "love" : i === 2 ? "work" : i === 3 ? "wealth" : i === 4 ? "sub" : "mind";
    const stipple = Array.from({ length: l.petals * (supportive ? 2 : 4) }, (_, k) => {
      const a = l.phase + k * Math.PI * 2 / (l.petals * 4) + (unit(i * 400 + k) - .5) * .025;
      const r = l.inner + (unit(i * 700 + k) * .78 + .11) * (l.outer - l.inner);
      const size = .55 + unit(i * 900 + k) * 1.45;
      return `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" r="${size.toFixed(2)}" fill="${k % 5 ? l.color : "#C49A3A"}" fill-opacity="${(.34 + unit(i * 1100 + k) * .42).toFixed(2)}"/>`;
    }).join("");
    const dash = `${(2.5 + unit(1400 + i) * 4).toFixed(1)} ${(5 + unit(1500 + i) * 8).toFixed(1)} ${(10 + unit(1600 + i) * 12).toFixed(1)} ${(3 + unit(1700 + i) * 4).toFixed(1)}`;
    const brokenBrush = `${(70 + unit(2300 + i) * 95).toFixed(1)} ${(9 + unit(2400 + i) * 25).toFixed(1)} ${(32 + unit(2500 + i) * 74).toFixed(1)} ${(5 + unit(2600 + i) * 16).toFixed(1)}`;
    const veinDash = `${(12 + unit(3100 + i) * 18).toFixed(1)} ${(3 + unit(3200 + i) * 7).toFixed(1)} ${(1 + unit(3300 + i) * 3).toFixed(1)} ${(4 + unit(3400 + i) * 9).toFixed(1)}`;
    const segmentFills = l.segments.map((segment, segmentIndex) => `<path data-motif-segment="petal-${segmentIndex}" d="${segment.path}" fill="url(#birthGradient${i})"/>`).join("");
    const innerFills = l.innerSegments.map((segment, segmentIndex) => `<path data-motif-segment="inlay-${segmentIndex}" d="${segment.path}" fill="url(#birthGradient${i})" fill-opacity=".68"/>`).join("");
    const facetFills = l.facetSegments.map((segment, segmentIndex) => `<path data-motif-segment="facet-${segmentIndex}" d="${segment.path}" fill="url(#birthGradient${i})" fill-opacity=".46"/>`).join("");
    colorLayers.push(`<g data-birth-color="${l.color}" data-color-role="${role}" data-color-emphasis="${supportive ? "supporting" : "primary"}" class="pigment-layer" opacity="${supportive ? ".72" : ".84"}">${segmentFills}${innerFills}${facetFills}<g clip-path="url(#motifClip${i})" class="oil-overlay" filter="url(#pigment${i})"><path d="${l.path}" fill="${l.color}" fill-opacity=".38"/>${stipple}</g><g clip-path="url(#motifClip${i})" class="oil-soft-light"><path d="${l.facetPath}" fill="url(#birthGradient${i})" fill-opacity=".76"/></g></g>`);
    shadowLayers.push(`<g data-motif-shading="${role}" clip-path="url(#motifClip${i})" class="motif-shadow"><path d="${l.innerPath}" fill="none" stroke="${birthColorTones(l.color).shadow}" stroke-opacity=".52" stroke-width="${(1.25 + unit(1800 + i) * .75).toFixed(2)}"/></g>`);
    goldLayers.push(`<g data-gold-filigree="${role}"><path d="${l.path}" fill="none" stroke="url(#agedGold)" stroke-opacity="${(.48 + i * .025).toFixed(2)}" stroke-width="${(.52 + unit(3500 + i) * .38).toFixed(2)}" stroke-linecap="round" stroke-dasharray="${veinDash}" filter="url(#roughGold)"/><path d="${l.facetPath}" fill="none" stroke="url(#leafGold)" stroke-opacity="${(.34 + i * .018).toFixed(2)}" stroke-width="${(.34 + unit(3600 + i) * .28).toFixed(2)}" stroke-dasharray="${dash}" stroke-dashoffset="${(unit(3700 + i) * 31).toFixed(1)}" filter="url(#fineGold)"/><path d="${l.guillochePath}" fill="none" stroke="url(#midGold)" stroke-opacity=".58" stroke-width="${(.52 + unit(1900 + i) * .45).toFixed(2)}" stroke-linecap="round" stroke-dasharray="${dash}" stroke-dashoffset="${(unit(2000 + i) * 19).toFixed(1)}" filter="url(#roughGold)"/></g>`);
  });
  const auraTone = traits.element ? ELEMENT_AURA[traits.element] : null;
  const goldTint = (hex: string) => auraTone ? mixHex(hex, auraTone, .1) : hex;
  const colorLayerEls = colorLayers.join("");
  const shadowLayerEls = shadowLayers.join("");
  const goldLayerEls = goldLayers.join("");
  const parts = particles.slice(0, 92).map((p, i) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(.35 + p.r * .46).toFixed(2)}" fill="${goldTint(i % 4 ? "#A77B2C" : "#D8B65C")}" fill-opacity="${(.24 + unit(2200 + i) * .42).toFixed(2)}"/>`).join("");
  const goldLeaf = particles.slice(16, 62).filter((_, i) => i % 2 === 0).map((p, i) => {
    const s = 1.4 + unit(4100 + i) * 3.2;
    const skew = (unit(4200 + i) - .5) * s;
    return `<path d="M${(p.x - s).toFixed(1)} ${(p.y + skew).toFixed(1)}l${(s * 1.2).toFixed(1)} ${(-s * .9).toFixed(1)}l${(s * .85).toFixed(1)} ${(s * 1.1).toFixed(1)}l${(-s * 1.35).toFixed(1)} ${(s * .48).toFixed(1)}Z" fill="url(#leafGold)" fill-opacity="${(.34 + unit(4300 + i) * .34).toFixed(2)}" filter="url(#fineGold)"/>`;
  }).join("");
  const gemRadius = compassR * .55;
  const refractedLight = Array.from({ length: 18 }, (_, i) => {
    const a = i / 18 * Math.PI * 2 + (unit(5000 + i) - .5) * .18;
    const start = gemRadius * (.72 + unit(5100 + i) * .22);
    const end = gemRadius * (1.28 + unit(5200 + i) * 2.55);
    const bend = (unit(5300 + i) - .5) * .32;
    const width = .004 + unit(5400 + i) * .014;
    const point = (r: number, da = 0) => `${(Math.cos(a + da) * r).toFixed(1)} ${(Math.sin(a + da) * r).toFixed(1)}`;
    const color = i % 5 === 0 ? "url(#platinumRay)" : i % 3 === 0 ? "url(#coreRay)" : "url(#goldRay)";
    return `<path d="M${point(start, -width)} Q${point((start + end) * .52, bend)} ${point(end)} Q${point((start + end) * .5, bend * .72)} ${point(start, width)}Z" fill="${color}" fill-opacity="${(.22 + unit(5500 + i) * .38).toFixed(2)}" filter="url(#rayTexture)"/>`;
  }).join("");
  const lightFilaments = Array.from({ length: 36 }, (_, i) => {
    const a = i / 36 * Math.PI * 2 + (unit(6000 + i) - .5) * .21;
    const start = gemRadius * (.78 + unit(6100 + i) * .24);
    const end = gemRadius * (1.15 + unit(6200 + i) * 2.25);
    const bend = (unit(6300 + i) - .5) * 54;
    const sx = Math.cos(a) * start, sy = Math.sin(a) * start;
    const ex = Math.cos(a) * end, ey = Math.sin(a) * end;
    const mx = Math.cos(a) * ((start + end) / 2) - Math.sin(a) * bend;
    const my = Math.sin(a) * ((start + end) / 2) + Math.cos(a) * bend;
    const stroke = i % 7 === 0 ? "url(#platinumRay)" : i % 4 === 0 ? "url(#coreRay)" : "url(#goldRay)";
    return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${stroke}" stroke-opacity="${(.2 + unit(6400 + i) * .46).toFixed(2)}" stroke-width="${(.16 + unit(6500 + i) * .48).toFixed(2)}" stroke-linecap="round" filter="url(#rayTexture)"/>`;
  }).join("");
  const filigreeRosettes = layers.map((l, i) => `<g opacity="${(.35 + i * .035).toFixed(2)}"><path d="${l.facetPath}" fill="none" stroke="#F5DEA0" stroke-width="${(.3 + i * .045).toFixed(2)}" stroke-dasharray="1 2 7 3" filter="url(#fineGold)"/><path d="${l.innerPath}" fill="none" stroke="url(#leafGold)" stroke-width="${(.48 + i * .055).toFixed(2)}" stroke-dasharray="19 3 2 4" filter="url(#roughGold)"/></g>`).join("");
  const crownJewels = Array.from({ length: 64 }, (_, i) => {
    const a = i / 64 * Math.PI * 2 + unit(6500 + i) * .006;
    const r = 420 + (i % 2) * 15 + (unit(6600 + i) - .5) * 4;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    const s = i % 8 === 0 ? 4.6 : 1.5 + unit(6700 + i) * 1.8;
    return `<path d="M${x.toFixed(1)} ${(y - s).toFixed(1)}L${(x + s * .62).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y + s).toFixed(1)}L${(x - s * .62).toFixed(1)} ${y.toFixed(1)}Z" fill="${i % 8 === 0 ? "#FFF4BF" : "url(#leafGold)"}" fill-opacity="${i % 8 === 0 ? ".88" : ".58"}" stroke="#7B551D" stroke-width=".35" filter="url(#fineGold)"/>`;
  }).join("");
  // A hand-painted, fully opaque diamond: every facet is a solid shade of the overall color.
  // Its cut (6/8/12 sides or radiant star) follows the user's essence type.
  const gemDark = mixHex(core, "#000000", .5);
  const gemShade = mixHex(core, "#000000", .26);
  const gemBright = mixHex(core, "#FFFFFF", .28);
  const gemGlint = mixHex(core, "#FFFFFF", .62);
  const cut = traits.gemCut;
  const sides = cut === "hexagon" ? 6 : cut === "dodecagon" ? 12 : cut === "star" ? 16 : 8;
  const gemPoint = (i: number, scale = 1) => {
    const a = -Math.PI / 2 + Math.PI / sides + i * Math.PI * 2 / sides;
    const star = cut === "star" && i % 2 === 1 && scale > .9 ? .74 : 1;
    return `${(Math.cos(a) * gemRadius * scale * star).toFixed(1)},${(Math.sin(a) * gemRadius * scale * star).toFixed(1)}`;
  };
  const gemOutline = Array.from({ length: sides }, (_, i) => gemPoint(i)).join(" ");
  const gemTable = Array.from({ length: sides }, (_, i) => gemPoint(i, .42)).join(" ");
  // Light falls from the upper left: facets facing (-1,-1) are brightest.
  const toneAt = (i: number, crown: boolean) => {
    const a = -Math.PI / 2 + Math.PI / sides + (i + .5) * Math.PI * 2 / sides;
    const lit = (-Math.cos(a) - Math.sin(a)) / Math.SQRT2 + (crown ? 0 : -.15);
    return lit > .75 ? gemGlint : lit > .3 ? gemBright : lit > -.2 ? core : lit > -.65 ? gemShade : gemDark;
  };
  const gemCrownFacets = Array.from({ length: sides }, (_, i) => `<path data-gem-facet="crown" d="M${gemPoint(i)} L${gemPoint((i + 1) % sides)} L${gemPoint((i + 1) % sides, .72)} L${gemPoint(i, .72)}Z" fill="${toneAt(i, true)}" stroke="${gemGlint}" stroke-opacity=".55" stroke-width=".35" stroke-linejoin="round"/>`).join("");
  const gemPavilionFacets = Array.from({ length: sides }, (_, i) => `<path data-gem-facet="pavilion" d="M${gemPoint(i, .72)} L${gemPoint((i + 1) % sides, .72)} L${gemPoint((i + 1) % sides, .42)} L${gemPoint(i, .42)}Z" fill="${toneAt(i, false)}" stroke="${gemGlint}" stroke-opacity=".42" stroke-width=".3" stroke-linejoin="round"/>`).join("");
  const aura = auraTone;
  const auraEl = aura ? `<circle data-element-aura="${traits.element}" r="512" fill="url(#elementAura)"/>` : "";
  const auraDef = aura ? `<radialGradient id="elementAura" cx="0" cy="0" r="512" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${aura}" stop-opacity=".22"/><stop offset=".55" stop-color="${aura}" stop-opacity=".1"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient>` : "";
  const gemPaintStrokes = Array.from({ length: 22 }, (_, i) => {
    const a = unit(8600 + i) * Math.PI * 2;
    const r = gemRadius * (.12 + unit(8700 + i) * .72);
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    const len = gemRadius * (.08 + unit(8800 + i) * .12);
    const tilt = -.75 + (unit(8900 + i) - .5) * .5;
    const dx = Math.cos(tilt) * len, dy = Math.sin(tilt) * len;
    const lit = x + y < 0;
    return `<path data-gem-oil-stroke="true" d="M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)}Q${(x + dy * .3).toFixed(1)} ${(y - dx * .3).toFixed(1)} ${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}" fill="none" stroke="${lit ? gemGlint : gemDark}" stroke-opacity="${lit ? ".32" : ".24"}" stroke-width="${(.6 + unit(9000 + i) * 1.1).toFixed(2)}" stroke-linecap="round"/>`;
  }).join("");
  const gemstoneSparkles = Array.from({ length: 4 }, (_, i) => {
    const a = -.92 + i * 1.57 + unit(6800 + i) * .12;
    const r = gemRadius * (.24 + unit(6900 + i) * .52);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const s = i === 0 ? 6.8 : 2.1 + unit(7000 + i) * 2.8;
    return `<path data-gem-sparkle="true" d="M${x.toFixed(1)} ${(y-s).toFixed(1)}C${(x+s*.12).toFixed(1)} ${(y-s*.25).toFixed(1)} ${(x+s*.25).toFixed(1)} ${(y-s*.12).toFixed(1)} ${(x+s).toFixed(1)} ${y.toFixed(1)}C${(x+s*.25).toFixed(1)} ${(y+s*.12).toFixed(1)} ${(x+s*.12).toFixed(1)} ${(y+s*.25).toFixed(1)} ${x.toFixed(1)} ${(y+s).toFixed(1)}C${(x-s*.12).toFixed(1)} ${(y+s*.25).toFixed(1)} ${(x-s*.25).toFixed(1)} ${(y+s*.12).toFixed(1)} ${(x-s).toFixed(1)} ${y.toFixed(1)}C${(x-s*.25).toFixed(1)} ${(y-s*.12).toFixed(1)} ${(x-s*.12).toFixed(1)} ${(y-s*.25).toFixed(1)} ${x.toFixed(1)} ${(y-s).toFixed(1)}Z" fill="#FFFFFF" fill-opacity="${i === 0 ? ".98" : ".86"}" filter="url(#gemSparkle)"/>`;
  }).join("");
  const birthSparkles = Array.from({ length: 420 }, (_, i) => {
    const a = unit(7100 + i) * Math.PI * 2;
    const r = Math.sqrt(unit(7500 + i)) * 452;
    if (r < gemRadius * 1.5) return "";
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    const color = codes[i % 7] ?? core;
    const scaleTier = i % 29 === 0 ? 6.4 + unit(7900 + i) * 4.8 : i % 9 === 0 ? 3.2 + unit(7900 + i) * 3.2 : i % 3 === 0 ? 1.25 + unit(7900 + i) * 2 : .35 + unit(7900 + i) * .95;
    const form = i % 4 === 0 ? "halo" : i % 4 === 1 ? "diamond" : i % 4 === 2 ? "flare" : "pinpoint";
    const shape = form === "halo"
      ? `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${scaleTier.toFixed(2)}" fill="none" stroke="${color}" stroke-width="${(scaleTier * .38).toFixed(2)}"/><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(scaleTier * .28).toFixed(2)}" fill="#FFFFFF"/>`
      : form === "diamond"
        ? `<path d="M${x.toFixed(2)} ${(y-scaleTier*1.7).toFixed(2)}L${(x+scaleTier*.72).toFixed(2)} ${y.toFixed(2)}L${x.toFixed(2)} ${(y+scaleTier*1.7).toFixed(2)}L${(x-scaleTier*.72).toFixed(2)} ${y.toFixed(2)}Z" fill="${color}"/><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(scaleTier*.18).toFixed(2)}" fill="#FFFFFF"/>`
        : form === "flare"
          ? `<path d="M${x.toFixed(2)} ${(y-scaleTier*3.2).toFixed(2)}Q${x.toFixed(2)} ${y.toFixed(2)} ${(x+scaleTier*1.8).toFixed(2)} ${y.toFixed(2)}Q${x.toFixed(2)} ${y.toFixed(2)} ${x.toFixed(2)} ${(y+scaleTier*3.2).toFixed(2)}Q${x.toFixed(2)} ${y.toFixed(2)} ${(x-scaleTier*1.8).toFixed(2)} ${y.toFixed(2)}Q${x.toFixed(2)} ${y.toFixed(2)} ${x.toFixed(2)} ${(y-scaleTier*3.2).toFixed(2)}Z" fill="${color}"/><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(scaleTier*.22).toFixed(2)}" fill="#FFFFFF"/>`
          : `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${scaleTier.toFixed(2)}" fill="${color}"/><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(scaleTier*.3).toFixed(2)}" fill="#FFFFFF"/>`;
    return `<g data-sparkle-color="${color}" data-sparkle-form="${form}" opacity="${(.7 + unit(8300 + i) * .3).toFixed(2)}" filter="url(#sparkleBloom)">${shape}</g>`;
  }).join("");
  const cosmicStars = Array.from({ length: 220 }, (_, i) => {
    const a = unit(9000 + i) * Math.PI * 2;
    const r = Math.sqrt(unit(9300 + i)) * 506;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    const size = i % 23 === 0 ? 2.2 + unit(9600 + i) * 2.4 : .28 + unit(9600 + i) * .92;
    const flare = i % 23 === 0 ? `<path d="M${x.toFixed(2)} ${(y-size*4).toFixed(2)}V${(y+size*4).toFixed(2)}M${(x-size*4).toFixed(2)} ${y.toFixed(2)}H${(x+size*4).toFixed(2)}" stroke="#FFFBE8" stroke-width="${(size*.28).toFixed(2)}" stroke-linecap="round"/>` : "";
    return `<g data-cosmic-star="true" filter="url(#starBloom)"><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${size.toFixed(2)}" fill="${i%7===0 ? (codes[i%7] ?? core) : "#FFFDF0"}" fill-opacity="${(.62+unit(9900+i)*.38).toFixed(2)}"/>${flare}</g>`;
  }).join("");
  const shellSpirals = Array.from({ length: 5 }, (_, shell) => {
    const cx = Math.cos(shell * Math.PI * 2 / 5 + .32) * 286;
    const cy = Math.sin(shell * Math.PI * 2 / 5 + .32) * 286;
    const scale = .54 + unit(10200 + shell) * .18;
    const path = Array.from({ length: 150 }, (_, i) => {
      const t = i / 149 * Math.PI * 5.2;
      const r = (5 + 8.15 * t) * scale;
      return `${i ? "L" : "M"}${(cx + Math.cos(t) * r).toFixed(1)} ${(cy + Math.sin(t) * r).toFixed(1)}`;
    }).join("");
    const chambers = Array.from({ length: 11 }, (_, i) => {
      const t = .55 + i * .38;
      const r = (5 + 8.15 * t) * scale;
      const x = cx + Math.cos(t) * r, y = cy + Math.sin(t) * r;
      return `<path d="M${cx.toFixed(1)} ${cy.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}"/>`;
    }).join("");
    return `<g data-agolmen-shell="nautilus" fill="none" stroke="url(#shellGold)" stroke-width="${(1.05+shell*.08).toFixed(2)}" stroke-opacity=".23" filter="url(#shellRelief)"><path d="${path}"/>${chambers}</g>`;
  }).join("");
  const brushSpiral = Array.from({ length: 190 }, (_, i) => { const t = i / 189; const a = t * Math.PI * 7.4 + workSeed % 17 * .07; const r = 31 + t * 417 + Math.sin(i * .71 + workSeed) * .8; return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; }).join("");
  const style = `<style>.pigment-layer{mix-blend-mode:overlay}.oil-overlay{mix-blend-mode:soft-light}.oil-soft-light{mix-blend-mode:color-burn}.motif-shadow{mix-blend-mode:multiply}</style>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-512 -512 1024 1024" width="1024" height="1024">${style}<defs>${auraDef}${textureDefs}<clipPath id="gemOctagon"><path d="M${gemOutline.replaceAll(" ", " L")}Z"/></clipPath><linearGradient id="agedGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6F4B18"/><stop offset=".48" stop-color="#B88935"/><stop offset="1" stop-color="#7A5420"/></linearGradient><linearGradient id="midGold" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#98702B"/><stop offset=".52" stop-color="#D5AF57"/><stop offset="1" stop-color="#A67B30"/></linearGradient><linearGradient id="leafGold" x1=".15" y1=".85" x2=".85" y2=".15"><stop offset="0" stop-color="#A97927"/><stop offset=".43" stop-color="#F0D98A"/><stop offset=".58" stop-color="#FFF0B0"/><stop offset="1" stop-color="#B48632"/></linearGradient><linearGradient id="shellGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".48" stop-color="#D7A83D"/><stop offset="1" stop-color="${core}"/></linearGradient><linearGradient id="corePaint" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".13" stop-color="${core}"/><stop offset=".43" stop-color="#6E5A28"/><stop offset=".68" stop-color="${core}"/><stop offset=".86" stop-color="#FFF4C7"/><stop offset="1" stop-color="#8B742E"/></linearGradient><linearGradient id="coreRay" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${core}" stop-opacity=".95"/><stop offset="1" stop-color="${core}" stop-opacity="0"/></linearGradient><radialGradient id="goldRay" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="450"><stop offset="0" stop-color="#FFF5CE"/><stop offset=".18" stop-color="#F6D875" stop-opacity=".95"/><stop offset=".52" stop-color="#E8BC58" stop-opacity=".62"/><stop offset="1" stop-color="#C28B2E" stop-opacity="0"/></radialGradient><radialGradient id="platinumRay" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="445"><stop offset="0" stop-color="#FFF9D8"/><stop offset=".38" stop-color="#FFF0AA" stop-opacity=".78"/><stop offset="1" stop-color="#EBC56C" stop-opacity="0"/></radialGradient><radialGradient id="gemLight" cx="34%" cy="30%" r="75%"><stop offset="0" stop-color="${gemGlint}"/><stop offset=".45" stop-color="${gemBright}"/><stop offset="1" stop-color="${core}"/></radialGradient><linearGradient id="gemSpectral" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${gemBright}"/><stop offset=".55" stop-color="${core}"/><stop offset="1" stop-color="${gemShade}"/></linearGradient><filter id="roughGold" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency=".015 .28" numOctaves="2" seed="${workSeed % 997}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2"/></filter><filter id="fineGold" x="-16%" y="-16%" width="132%" height="132%"><feTurbulence type="fractalNoise" baseFrequency=".045 .19" numOctaves="2" seed="${(workSeed + 211) % 997}" result="fleck"/><feDisplacementMap in="SourceGraphic" in2="fleck" scale="1.15"/></filter><filter id="rayTexture" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="${(workSeed + 317) % 997}" result="rayNoise"/><feDisplacementMap in="SourceGraphic" in2="rayNoise" scale="3.4"/></filter><filter id="coreTexture" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="turbulence" baseFrequency=".025 .16" numOctaves="3" seed="${(workSeed + 83) % 997}" result="paint"/><feDisplacementMap in="SourceGraphic" in2="paint" scale="2.8"/></filter><filter id="gemOilPaint" x="-18%" y="-18%" width="136%" height="136%"><feTurbulence type="fractalNoise" baseFrequency=".035 .16" numOctaves="4" seed="${(workSeed + 887) % 997}" result="oilGrain"/><feDisplacementMap in="SourceGraphic" in2="oilGrain" scale="1.35"/><feSpecularLighting in="oilGrain" surfaceScale="1.6" specularConstant=".16" specularExponent="26" lighting-color="#FFF9E8" result="oilShine"><feDistantLight azimuth="225" elevation="58"/></feSpecularLighting><feComposite in="oilShine" in2="SourceGraphic" operator="in" result="litPaint"/><feBlend in="SourceGraphic" in2="litPaint" mode="screen"/></filter><filter id="flowPaint" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".018 .11" numOctaves="3" seed="${(workSeed + 431) % 997}" result="flowGrain"/><feDisplacementMap in="SourceGraphic" in2="flowGrain" scale="4.8"/></filter><filter id="sparkleBloom" x="-350%" y="-350%" width="800%" height="800%"><feGaussianBlur stdDeviation="3.2" result="bloom"/><feGaussianBlur stdDeviation="7" result="halo"/><feMerge><feMergeNode in="halo"/><feMergeNode in="bloom"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="starBloom" x="-400%" y="-400%" width="900%" height="900%"><feGaussianBlur stdDeviation="2.3" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="shellRelief" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".35"/><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#F7D77C" flood-opacity=".35"/></filter><filter id="gemSparkle" x="-250%" y="-250%" width="600%" height="600%"><feGaussianBlur stdDeviation="1.8" result="shine"/><feMerge><feMergeNode in="shine"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="gemstoneRealism" x="-300%" y="-300%" width="700%" height="700%"><feDropShadow dx="-.25" dy="-.5" stdDeviation="1.1" flood-color="${core}" flood-opacity=".72"/><feDropShadow dx="0" dy="0" stdDeviation="1.8" flood-color="#FFF1A8" flood-opacity=".48"/></filter></defs><g>${auraEl}${cosmicStars}${shellSpirals}<g data-color-layers="path-bound">${colorLayerEls}</g><g data-shading-layers="top">${shadowLayerEls}</g><g data-refracted-light="18">${refractedLight}${lightFilaments}</g><g data-gold-layer="top">${goldLayerEls}${filigreeRosettes}<path d="${brushSpiral}" fill="none" stroke="url(#midGold)" stroke-width="1.05" stroke-opacity=".46" stroke-linecap="round" stroke-dasharray="3 7 15 5" filter="url(#roughGold)"/><circle r="447" fill="none" stroke="url(#agedGold)" stroke-opacity=".58" stroke-width="1.2" stroke-dasharray="18 3 5 8" filter="url(#roughGold)"/><circle r="441" fill="none" stroke="url(#leafGold)" stroke-opacity=".4" stroke-width=".65" stroke-dasharray="2 5 11 4"/>${crownJewels}${parts}${goldLeaf}</g>${birthSparkles}<g data-core-gemstone="${core}" data-gem-center="0,0" data-gem-shape="${cut === "octagon" ? "octagonal-diamond" : cut}" data-gem-sides="${sides}" data-symmetry="${traits.symmetry || "default"}" data-gem-radius-ratio="0.55" data-gem-setting="inset" filter="url(#gemstoneRealism)"><path data-gem-occlusion="opaque" d="M${gemOutline.replaceAll(" ", " L")}Z" fill="${core}"/><g clip-path="url(#gemOctagon)" filter="url(#gemOilPaint)"><path d="M${gemOutline.replaceAll(" ", " L")}Z" fill="${core}"/>${gemCrownFacets}${gemPavilionFacets}<path data-birth-color="${core}" d="M${gemTable.replaceAll(" ", " L")}Z" fill="url(#gemLight)" stroke="${gemGlint}" stroke-opacity=".7" stroke-width=".35"/>${gemPaintStrokes}</g><path d="M${gemPoint(sides - 2, .9)}L${gemPoint(sides - 1, .9)}L${gemPoint(0, .9)}" fill="none" stroke="#FFFFFF" stroke-opacity=".85" stroke-width=".6" stroke-linecap="round"/>${gemstoneSparkles}</g></g></svg>`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image unavailable"));
    img.src = src;
  });
}

async function hybridToPng(svg: string): Promise<Blob> {
  const baseBlob = await fetch(BASE_IMAGE).then(response => {
    if (!response.ok) throw new Error("Base artwork unavailable");
    return response.blob();
  });
  const baseData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Base artwork unavailable"));
    reader.onerror = () => reject(new Error("Base artwork unavailable"));
    reader.readAsDataURL(baseBlob);
  });
  const plateContent = svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"));
  const mergedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-512 -512 1024 1024" width="2048" height="2048"><image href="${baseData}" x="-512" y="-512" width="1024" height="1024" preserveAspectRatio="xMidYMid meet"/>${plateContent}</svg>`;
  const merged = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(mergedSvg)}`);
  return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = OUT; canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(merged, 0, 0, OUT, OUT);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG failed")), "image/png");
  });
}

export default function MandalaCanvas({ colors, language, variation, reduced, traits = DEFAULT_TRAITS, onCapture }: Props) {
  const copy = artSpecialistCopy[language];
  const tl = mandalaTraitLabels[language];
  const [baseReady, setBaseReady] = useState(false);
  const codes = useMemo(() => colors.map(c => c.code), [colors]);
  const live = useMemo(() => buildMandalaColorPlate(codes, variation, !reduced, traits), [codes, variation, reduced, traits]);
  const capture = useCallback<Capture>(async () => ({ blob: await hybridToPng(buildMandalaColorPlate(codes, variation, false, traits)), width: OUT, height: OUT }), [codes, variation, traits]);
  useEffect(() => { onCapture(capture); return () => onCapture(null); }, [capture, onCapture]);

  return <div role="img" aria-label={copy.mandalaAlt} className="relative grid h-full w-full place-items-center overflow-hidden bg-art-void">
    <img src={BASE_IMAGE} alt="" aria-hidden="true" width={1024} height={1024} onLoad={() => setBaseReady(true)} className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${baseReady ? "opacity-100" : "opacity-0"}`} />
    <div className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: live }} />
    {traits.lifePath !== null && <p data-mandala-traits="true" className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/30 bg-background/70 px-3 py-1 text-[11px] text-primary/90">{`${tl.numerology} ${traits.lifePath} ・ ${tl.element} ${traits.element ? tl.elements[traits.element] : "—"} ・ ${tl.cuts[traits.gemCut]}${language === "ja" ? "カット" : ""}`}</p>}
  </div>;
}
