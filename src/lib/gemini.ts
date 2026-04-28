import type { Blueprint, Platform, ProductionOutput } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// ── Platform deliverable specifications ──────────────────────────────────────
export const PLATFORM_DELIVERABLE: Record<Platform, { label: string; briefAugment: string; artboard: { w: number; h: number }; color: string }> = {
  illustrator: {
    label: 'Instagram Poster',
    briefAugment: 'Create an Instagram square post (1080×1080px). Bold visual composition, eye-catching typography, strong brand color use, vector art, export-ready social media graphic.',
    artboard: { w: 1080, h: 1080 },
    color: '#FF9A00',
  },
  indesign: {
    label: 'Promotional Flyer',
    briefAugment: 'Design a print-ready A5 promotional flyer (148×210mm). Structured grid layout, headline hierarchy, body copy sections, offer/pricing block, contact details, strong CTA. CMYK print-ready.',
    artboard: { w: 1748, h: 2480 },
    color: '#FF3366',
  },
  after_effects: {
    label: 'Instagram Reel',
    briefAugment: 'Create a 30-second Instagram Reel (1080×1920px vertical). Animated text reveals, dynamic scene transitions, motion blur, particle effects, loop-ready. Include keyframe markers at 0s, 5s, 15s, 25s, 30s.',
    artboard: { w: 1080, h: 1920 },
    color: '#9B59FF',
  },
  blender: {
    label: '3D Cinematic',
    briefAugment: 'Create a photorealistic 3D cinematic scene. Dramatic three-point lighting, Cycles render engine, particle/smoke system, animated camera dolly, 4K output. Include material nodes for photorealism.',
    artboard: { w: 3840, h: 2160 },
    color: '#00C2FF',
  },
};

// ── Gemini API wrapper ────────────────────────────────────────────────────────
async function generateWithGemini(prompt: string): Promise<string> {
  if (!API_KEY) throw new Error('No API key configured');
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  return response.text ?? '';
}

// ── Blueprint Generation ──────────────────────────────────────────────────────
export async function generateBlueprint(brief: string, platform: Platform): Promise<Blueprint> {
  const d = PLATFORM_DELIVERABLE[platform];
  const platformNames: Record<Platform, string> = {
    illustrator: 'Adobe Illustrator',
    indesign: 'Adobe InDesign',
    after_effects: 'Adobe After Effects',
    blender: 'Blender',
  };

  try {
    const prompt = `You are an expert digital design director. Generate a production blueprint JSON.

Creative Brief: "${brief}"
Platform: ${platformNames[platform]}
Deliverable: ${d.label} — ${d.briefAugment}
Canvas: ${d.artboard.w}×${d.artboard.h}px

Respond ONLY with valid JSON:
{
  "title": "string",
  "platform": "${platform}",
  "strategy": "string (2-3 sentences, mention the brief topic and deliverable type)",
  "colorPalette": ["#hex1","#hex2","#hex3","#hex4"],
  "typography": { "heading": "font name", "body": "font name" },
  "artboards": [
    {
      "id": "a1",
      "name": "string",
      "width": ${d.artboard.w},
      "height": ${d.artboard.h},
      "layers": [
        { "name": "string", "type": "Background|Shape|Text|Image|Group|Effect", "description": "string", "properties": { "key": "value" } }
      ]
    }
  ],
  "designNotes": ["string","string","string"]
}`;

    const text = await generateWithGemini(prompt);
    const json = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(json) as Blueprint;
  } catch {
    return getMockBlueprint(brief, platform);
  }
}

// ── Script Generation ─────────────────────────────────────────────────────────
export async function generateProductionScript(blueprint: Blueprint): Promise<ProductionOutput> {
  const isBlender = blueprint.platform === 'blender';
  const ext = isBlender ? 'py' : 'jsx';
  const d = PLATFORM_DELIVERABLE[blueprint.platform];

  try {
    const prompt = `You are an expert ${isBlender ? 'Blender Python' : 'Adobe ExtendScript'} developer.
Generate a complete, runnable ${ext} script for:
- Deliverable: ${d.label}
- Brief: ${blueprint.strategy}
- Platform: ${blueprint.platform}
- Artboard: ${blueprint.artboards[0]?.width ?? d.artboard.w}×${blueprint.artboards[0]?.height ?? d.artboard.h}px

Blueprint:
${JSON.stringify({ colorPalette: blueprint.colorPalette, typography: blueprint.typography, designNotes: blueprint.designNotes }, null, 2)}

Write a complete, executable ${ext} script with comments. Be specific to the deliverable type.`;

    const script = await generateWithGemini(prompt);
    return {
      script: script.replace(/```[a-z]*\n?/g, '').replace(/```\n?/g, '').trim(),
      svgPreview: generateSVGPreview(blueprint),
      exportFormats: isBlender ? ['.py', '.blend', '.png'] : ['.jsx', '.pdf', '.png'],
      artboardCount: blueprint.artboards.length,
    };
  } catch {
    return {
      script: getMockScript(blueprint),
      svgPreview: generateSVGPreview(blueprint),
      exportFormats: isBlender ? ['.py', '.blend', '.png'] : ['.jsx', '.pdf', '.png'],
      artboardCount: blueprint.artboards.length,
    };
  }
}

// ── Mock Blueprint (platform-aware) ──────────────────────────────────────────
function getMockBlueprint(brief: string, platform: Platform): Blueprint {
  const d = PLATFORM_DELIVERABLE[platform];
  const title = brief.split(' ').slice(0, 6).join(' ');

  const layerSets: Record<Platform, Blueprint['artboards'][0]['layers']> = {
    illustrator: [
      { name: 'Background', type: 'Background', description: 'Full-bleed gradient base', properties: { fill: 'linear-gradient(135deg,#0D0F1A,#1A1D2E)' } },
      { name: 'Hero Image Area', type: 'Image', description: 'Focal product/food photography placeholder', properties: { size: '600x600px', position: 'center' } },
      { name: 'Overlay Gradient', type: 'Shape', description: 'Bottom-to-top color fade for text legibility', properties: { fill: 'linear-gradient(0deg,rgba(0,0,0,0.75),transparent)' } },
      { name: 'Headline', type: 'Text', description: 'Large display headline — aggressive tracking', properties: { font: 'Space Grotesk 800', size: '72px', color: '#FFFFFF' } },
      { name: 'Sub-copy', type: 'Text', description: 'Supporting tagline text', properties: { font: 'Inter 500', size: '24px', color: 'rgba(255,255,255,0.8)' } },
      { name: 'Brand Bar', type: 'Shape', description: 'Bottom brand accent strip', properties: { height: '6px', fill: d.color } },
    ],
    indesign: [
      { name: 'Background', type: 'Background', description: 'Clean white base with subtle texture', properties: { fill: '#FAFAFA' } },
      { name: 'Header Band', type: 'Shape', description: 'Top color brand strip', properties: { height: '80px', fill: d.color } },
      { name: 'Logo Placeholder', type: 'Image', description: 'Client logo zone with clearspace', properties: { size: '160x60px', position: 'top-left' } },
      { name: 'Hero Headline', type: 'Text', description: 'Large attention-grabbing headline', properties: { font: 'Space Grotesk 700', size: '48px', color: '#0D0F1A' } },
      { name: 'Body Text', type: 'Text', description: 'Descriptive body copy block', properties: { font: 'Inter 400', size: '14px', color: '#333333' } },
      { name: 'Offer Block', type: 'Shape', description: 'Highlighted price/offer callout box', properties: { fill: d.color + '20', border: `2px solid ${d.color}`, radius: '8px' } },
      { name: 'CTA Button', type: 'Shape', description: 'Call-to-action with contrasting color', properties: { fill: d.color, radius: '4px', padding: '12px 24px' } },
      { name: 'Footer', type: 'Group', description: 'Contact, website, QR code zone', properties: { position: 'bottom', height: '60px' } },
    ],
    after_effects: [
      { name: 'Background', type: 'Background', description: 'Full-bleed animated gradient base', properties: { fill: '#0D0F1A', animation: 'hue-rotate 8s loop' } },
      { name: 'Intro Reveal', type: 'Effect', description: 'Brand logo wipe-in at 0s', properties: { keyframe: '0s-1.5s', easing: 'cubic-bezier(0.16,1,0.3,1)' } },
      { name: 'Hero Visual', type: 'Image', description: 'Main visual scales in with parallax', properties: { keyframe: '1s-3s', transform: 'scale(0.8→1.0)' } },
      { name: 'Headline Animate', type: 'Text', description: 'Word-by-word character drop-in', properties: { keyframe: '2s-4s', font: 'Space Grotesk 800', size: '64px' } },
      { name: 'Particle System', type: 'Effect', description: 'Floating particle overlay', properties: { count: '120', size: '2-8px', opacity: '0.4' } },
      { name: 'CTA Slide', type: 'Text', description: 'CTA text slides in from bottom at 25s', properties: { keyframe: '25s-27s', easing: 'ease-out' } },
      { name: 'Outro Fade', type: 'Effect', description: 'Final brand hold + fade to black', properties: { keyframe: '27s-30s', opacity: '1→0' } },
    ],
    blender: [
      { name: 'World Environment', type: 'Background', description: 'HDRi studio lighting environment', properties: { hdri: 'studio_warm_4k.hdr', strength: '1.2' } },
      { name: 'Hero Object', type: 'Group', description: 'Main 3D subject with PBR material', properties: { poly: '<500k tris', material: 'Principled BSDF' } },
      { name: 'Steam/Smoke Particles', type: 'Effect', description: 'Dynamic particle system for atmosphere', properties: { count: '10000', lifetime: '80f', velocity: '(0,0,0.5)' } },
      { name: 'Key Light', type: 'Shape', description: 'Main dramatic area light', properties: { type: 'Area', power: '800W', color: '#FFF5E4' } },
      { name: 'Fill Light', type: 'Shape', description: 'Soft fill from opposite side', properties: { type: 'Area', power: '200W', color: '#C4D8FF' } },
      { name: 'Camera Dolly', type: 'Group', description: 'Animated camera path with focus rack', properties: { path: 'arc', frames: '0-120', fov: '50mm' } },
      { name: 'Ground Plane', type: 'Shape', description: 'Reflective surface beneath hero object', properties: { material: 'glossy-reflective', roughness: '0.1' } },
    ],
  };

  return {
    title,
    platform,
    strategy: `A high-impact ${d.label} for "${brief.substring(0, 60)}". The production leverages ${platform === 'blender' ? 'photorealistic 3D rendering' : 'bold typographic hierarchy and purposeful layout'} to maximize audience engagement. Every element is optimised for ${d.label.toLowerCase()} format and distribution.`,
    colorPalette: ['#0D0F1A', d.color, '#F8FAFF', '#C4C6FF'],
    typography: { heading: 'Space Grotesk', body: 'Inter' },
    artboards: [{
      id: 'a1',
      name: `${d.label} — Main`,
      width: d.artboard.w,
      height: d.artboard.h,
      layers: layerSets[platform],
    }],
    designNotes: [
      `Canvas: ${d.artboard.w}×${d.artboard.h}px — optimised for ${d.label}`,
      `Primary accent color ${d.color} used for all focal and interactive elements.`,
      `Typography: Space Grotesk for headlines (aggressive tracking), Inter for body. Never deviate.`,
    ],
  };
}

// ── Mock Script (platform + deliverable aware) ────────────────────────────────
function getMockScript(blueprint: Blueprint): string {
  const d = PLATFORM_DELIVERABLE[blueprint.platform];
  const topic = blueprint.title;

  if (blueprint.platform === 'blender') {
    return `# Bold Layers — Blender Production Script
# Deliverable: ${d.label}
# Brief: ${topic}
# Generated by Bold Layers Neural Workflow v1.2.4

import bpy, mathutils, random

# ── Scene Reset ──────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# ── Render Settings ──────────────────────────────────────────────────────────
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.resolution_x = ${d.artboard.w}
scene.render.resolution_y = ${d.artboard.h}
scene.render.resolution_percentage = 100
scene.cycles.samples = 256
scene.cycles.use_denoising = True
scene.frame_start = 1
scene.frame_end = 120

# ── Color Palette ─────────────────────────────────────────────────────────────
COLORS = ${JSON.stringify(blueprint.colorPalette)}
def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16)/255 for i in (0,2,4))

# ── Materials ─────────────────────────────────────────────────────────────────
def make_material(name, hex_color, roughness=0.4, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    r, g, b = hex_to_rgb(hex_color)
    bsdf.inputs['Base Color'].default_value = (r, g, b, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    return mat

mat_hero    = make_material('Hero_Material',    COLORS[1], roughness=0.2)
mat_ground  = make_material('Ground_Material',  COLORS[0], roughness=0.1, metallic=0.8)
mat_accent  = make_material('Accent_Material',  COLORS[3], roughness=0.05)

# ── Hero Object ────────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.2, location=(0, 0, 1.2))
hero = bpy.context.active_object
hero.name = 'Hero_Object_${topic.replace(/\s+/g, '_').slice(0, 20)}'
hero.data.materials.append(mat_hero)

# Subdivision for smoothness
sub = hero.modifiers.new('Subdivision', 'SUBSURF')
sub.levels = 3

# ── Ground Plane ──────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = 'Ground_Plane'
ground.data.materials.append(mat_ground)

# ── Particle System (steam/atmosphere) ───────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 1.2))
emitter = bpy.context.active_object
emitter.name = 'Steam_Emitter'
ps = emitter.modifiers.new('ParticleSystem', 'PARTICLE_SYSTEM').particle_system
ps.settings.count = 5000
ps.settings.lifetime = 80
ps.settings.normal_factor = 0.5
ps.settings.factor_random = 0.3
ps.settings.render_type = 'HALO'
ps.settings.particle_size = 0.04

# ── Lighting Setup ────────────────────────────────────────────────────────────
# Key Light
bpy.ops.object.light_add(type='AREA', location=(3, -3, 5))
key = bpy.context.active_object
key.name = 'Key_Light'
key.data.energy = 800
key.data.size = 2
key.rotation_euler = (0.8, 0, 0.5)

# Fill Light
bpy.ops.object.light_add(type='AREA', location=(-4, 2, 3))
fill = bpy.context.active_object
fill.name = 'Fill_Light'
fill.data.energy = 200

# Rim Light
bpy.ops.object.light_add(type='SPOT', location=(0, 4, 6))
rim = bpy.context.active_object
rim.name = 'Rim_Light'
rim.data.energy = 500
rim.data.spot_size = 0.6

# ── Camera with Animated Dolly ────────────────────────────────────────────────
bpy.ops.object.camera_add(location=(5, -5, 3))
cam = bpy.context.active_object
cam.name = 'Production_Camera'
cam.rotation_euler = (1.1, 0, 0.7)
cam.data.lens = 50  # 50mm cinematic
scene.camera = cam

# Animate camera (dolly arc)
cam.keyframe_insert('location', frame=1)
cam.location = (4, -6, 2.5)
cam.keyframe_insert('location', frame=60)
cam.location = (6, -4, 3.5)
cam.keyframe_insert('location', frame=120)

# ── World / HDRI ──────────────────────────────────────────────────────────────
world = scene.world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs['Strength'].default_value = 0.5

# ── Render Output ─────────────────────────────────────────────────────────────
scene.render.filepath = '//renders/boldlayers_${topic.replace(/\s+/g, '_').slice(0, 20)}_####'
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'

print(f"Bold Layers: '{topic}' — ${d.label} scene ready.")
print(f"Frames: {scene.frame_start} to {scene.frame_end} @ ${d.artboard.w}x${d.artboard.h}")
print("Run: bpy.ops.render.render(animation=True) to render all frames.")
`;
  }

  // ExtendScript for Adobe apps
  const target = blueprint.platform === 'after_effects' ? 'aftereffects' : blueprint.platform === 'indesign' ? 'indesign' : 'illustrator';

  if (blueprint.platform === 'after_effects') {
    return `// Bold Layers — After Effects ExtendScript
// Deliverable: ${d.label} (${d.artboard.w}×${d.artboard.h}px)
// Brief: ${topic}
// Generated by Bold Layers Neural Workflow v1.2.4
#target aftereffects

(function () {
  "use strict";
  var BRIEF   = "${topic.replace(/"/g, '\\"')}";
  var COLORS  = ${JSON.stringify(blueprint.colorPalette)};
  var W = ${d.artboard.w}, H = ${d.artboard.h}, FPS = 30, DURATION = 30;

  function hexToRgb(hex) {
    hex = hex.replace('#','');
    return [parseInt(hex.slice(0,2),16)/255, parseInt(hex.slice(2,4),16)/255, parseInt(hex.slice(4,6),16)/255];
  }

  // Create composition
  var comp = app.project.items.addComp(
    "BoldLayers_${topic.replace(/\s+/g, '_').slice(0, 18)}_Reel",
    W, H, 1.0, DURATION, FPS
  );

  // ── Background Layer ──────────────────────────────────────────────────────
  var bgSolid = comp.layers.addSolid(hexToRgb(COLORS[0]).concat([1]), "Background", W, H, 1.0, DURATION);
  bgSolid.moveToEnd();

  // ── Intro Brand Reveal (0s–1.5s) ────────────────────────────────────────
  var brandText = comp.layers.addText("BOLD LAYERS");
  var brandTf   = brandText.property("Source Text").value;
  brandTf.fontSize = 32;
  brandTf.fillColor = hexToRgb(COLORS[1]);
  brandTf.tracking = 300;
  brandText.property("Source Text").setValue(brandTf);
  brandText.property("Transform").property("Opacity").setValueAtTime(0, 0);
  brandText.property("Transform").property("Opacity").setValueAtTime(0.5, 100);
  brandText.property("Transform").property("Opacity").setValueAtTime(1.5, 100);
  brandText.property("Transform").property("Opacity").setValueAtTime(2.0, 0);

  // ── Main Headline (2s–5s) ────────────────────────────────────────────────
  var headline = comp.layers.addText("${topic.substring(0, 40)}");
  var hlTf     = headline.property("Source Text").value;
  hlTf.fontSize = 80;
  hlTf.fillColor = [1, 1, 1];
  hlTf.font = "SpaceGrotesk-Bold";
  hlTf.tracking = -20;
  headline.property("Source Text").setValue(hlTf);

  // Position — slide up from bottom
  var hlPos = headline.property("Transform").property("Position");
  hlPos.setValueAtTime(2.0, [W/2, H * 0.6]);
  hlPos.setValueAtTime(3.0, [W/2, H * 0.5]);
  var hlOp = headline.property("Transform").property("Opacity");
  hlOp.setValueAtTime(2.0, 0);
  hlOp.setValueAtTime(2.5, 100);
  hlOp.setValueAtTime(25.0, 100);
  hlOp.setValueAtTime(26.0, 0);

  // ── Accent Line Wipe (3s) ────────────────────────────────────────────────
  var accentLine = comp.layers.addSolid(hexToRgb(COLORS[1]).concat([1]), "Accent_Line", W, 4, 1.0, DURATION);
  accentLine.property("Transform").property("Position").setValue([W/2, H * 0.62]);
  accentLine.property("Transform").property("Scale").setValueAtTime(3.0, [0, 100]);
  accentLine.property("Transform").property("Scale").setValueAtTime(3.8, [100, 100]);

  // ── CTA Slide (25s–28s) ──────────────────────────────────────────────────
  var ctaText = comp.layers.addText("SWIPE UP · LEARN MORE");
  var ctaTf   = ctaText.property("Source Text").value;
  ctaTf.fontSize = 28;
  ctaTf.fillColor = hexToRgb(COLORS[1]);
  ctaTf.tracking = 200;
  ctaText.property("Source Text").setValue(ctaTf);
  ctaText.property("Transform").property("Position").setValue([W/2, H * 0.85]);
  var ctaOp = ctaText.property("Transform").property("Opacity");
  ctaOp.setValueAtTime(25.0, 0);
  ctaOp.setValueAtTime(26.0, 100);
  ctaOp.setValueAtTime(28.5, 100);
  ctaOp.setValueAtTime(30.0, 0);

  // ── Outro Fade ───────────────────────────────────────────────────────────
  var outro = comp.layers.addSolid([0,0,0,1], "Outro_Black", W, H, 1.0, DURATION);
  outro.property("Transform").property("Opacity").setValueAtTime(28.0, 0);
  outro.property("Transform").property("Opacity").setValueAtTime(30.0, 100);

  app.project.renderQueue.items.add(comp);
  $.writeln("Bold Layers: '${topic}' — ${d.label} composition created. " + DURATION + "s @ " + FPS + "fps");
  $.writeln("Canvas: " + W + "×" + H + "px | Layers: " + comp.numLayers);
})();
`;
  }

  if (blueprint.platform === 'indesign') {
    return `// Bold Layers — Adobe InDesign ExtendScript
// Deliverable: ${d.label} (A5 — ${d.artboard.w}×${d.artboard.h}px)
// Brief: ${topic}
// Generated by Bold Layers Neural Workflow v1.2.4
#target indesign

(function () {
  "use strict";
  var BRIEF   = "${topic.replace(/"/g, '\\"')}";
  var COLORS  = ${JSON.stringify(blueprint.colorPalette)};
  var W_MM = 148, H_MM = 210;

  function mm(v) { return v * 2.8346456693; } // mm → pts

  // New document
  var doc = app.documents.add();
  var page = doc.pages[0];
  doc.documentPreferences.pageWidth  = mm(W_MM);
  doc.documentPreferences.pageHeight = mm(H_MM);
  doc.documentPreferences.facingPages = false;
  doc.name = "BoldLayers_${topic.replace(/\s+/g, '_').slice(0, 18)}_Flyer";

  // ── Paragraph Styles ─────────────────────────────────────────────────────
  var styleH = doc.paragraphStyles.add({ name: "BL_Headline",
    pointSize: 36, appliedFont: "Space Grotesk", fontStyle: "Bold",
    fillColor: doc.colors.add({ model: ColorModel.PROCESS, colorValue: [0,0,0,85], name: "BL_Dark" })
  });
  var styleBody = doc.paragraphStyles.add({ name: "BL_Body",
    pointSize: 11, leading: 17, appliedFont: "Inter", fontStyle: "Regular"
  });

  // ── Header Band ──────────────────────────────────────────────────────────
  var header = page.textFrames.add();
  header.geometricBounds = [0, 0, mm(22), mm(W_MM)];
  header.fillColor = doc.colors.add({ model: ColorModel.PROCESS, colorValue: [0,0,100,0], name: "BL_Accent" });
  header.strokeWeight = 0;

  // ── Headline ─────────────────────────────────────────────────────────────
  var hlFrame = page.textFrames.add();
  hlFrame.geometricBounds = [mm(26), mm(8), mm(70), mm(W_MM - 8)];
  hlFrame.contents = "${topic.substring(0, 50)}";
  hlFrame.paragraphs[0].applyStyle(styleH, true);

  // ── Body Copy ────────────────────────────────────────────────────────────
  var bodyFrame = page.textFrames.add();
  bodyFrame.geometricBounds = [mm(74), mm(8), mm(130), mm(W_MM - 8)];
  bodyFrame.contents = "Experience the finest quality. Our ${topic.substring(0, 30)} offering is crafted with care and attention to detail.\\rAvailable now — limited time offer.\\r\\rContact us to find out more and book your experience today.";
  bodyFrame.paragraphs.everyItem().applyStyle(styleBody, true);

  // ── Offer Box ────────────────────────────────────────────────────────────
  var offerFrame = page.textFrames.add();
  offerFrame.geometricBounds = [mm(132), mm(8), mm(165), mm(W_MM - 8)];
  offerFrame.contents = "SPECIAL OFFER\\rBook Now & Save 20%";
  offerFrame.fillColor = doc.swatches.item("BL_Accent");
  offerFrame.strokeWeight = 0;

  // ── Footer ───────────────────────────────────────────────────────────────
  var footerFrame = page.textFrames.add();
  footerFrame.geometricBounds = [mm(H_MM - 18), mm(8), mm(H_MM - 4), mm(W_MM - 8)];
  footerFrame.contents = "boldlayers.studio  ·  hello@boldlayers.studio  ·  +1 (555) 000-0000";

  // ── Export PDF ───────────────────────────────────────────────────────────
  var exportOpts = new PDFExportPreference();
  exportOpts.pageRange = PageRange.ALL_PAGES;
  doc.exportFile(ExportFormat.PDF_TYPE, new File("/tmp/BoldLayers_Flyer.pdf"), false);

  $.writeln("Bold Layers: '${topic}' — ${d.label} created.");
  $.writeln("Pages: " + doc.pages.length + " | Size: A5 (" + W_MM + "×" + H_MM + "mm)");
})();
`;
  }

  // Illustrator (Instagram Poster)
  return `// Bold Layers — Adobe Illustrator ExtendScript
// Deliverable: ${d.label} (${d.artboard.w}×${d.artboard.h}px — Square)
// Brief: ${topic}
// Generated by Bold Layers Neural Workflow v1.2.4
#target illustrator

(function () {
  "use strict";
  var BRIEF  = "${topic.replace(/"/g, '\\"')}";
  var COLORS = ${JSON.stringify(blueprint.colorPalette)};
  var W = ${d.artboard.w}, H = ${d.artboard.h};

  function hexToRgb(hex) {
    hex = hex.replace('#','');
    return { r: parseInt(hex.slice(0,2),16)/255, g: parseInt(hex.slice(2,4),16)/255, b: parseInt(hex.slice(4,6),16)/255 };
  }

  function setFillColor(item, hex) {
    var c = hexToRgb(hex);
    item.fillColor = new RGBColor();
    item.fillColor.red   = c.r * 255;
    item.fillColor.green = c.g * 255;
    item.fillColor.blue  = c.b * 255;
  }

  // New document — Instagram square
  var docPreset     = new DocumentPreset();
  docPreset.width   = W;
  docPreset.height  = H;
  docPreset.colorMode = DocumentColorSpace.RGB;
  docPreset.rasterResolution = DocumentRasterResolution.HighResolution;
  var doc = app.documents.addDocument("", docPreset);
  doc.name = "BoldLayers_${topic.replace(/\s+/g, '_').slice(0, 20)}_InstaPost";

  var layer = doc.layers[0];
  layer.name = "Production";

  // ── Background ───────────────────────────────────────────────────────────
  var bg = layer.pathItems.rectangle(H, 0, W, H);
  bg.name = "Background";
  setFillColor(bg, COLORS[0]);
  bg.stroked = false;
  bg.zOrder(ZOrderMethod.SENDTOBACK);

  // ── Accent Circle (visual interest) ──────────────────────────────────────
  var circle = layer.pathItems.ellipse(H * 0.7, W * 0.55, W * 0.55, W * 0.55);
  setFillColor(circle, COLORS[1]);
  circle.opacity = 15;
  circle.stroked = false;
  circle.name = "Accent_Circle";

  // ── Brand Accent Line ─────────────────────────────────────────────────────
  var accentLine = layer.pathItems.rectangle(H * 0.62, W * 0.08, W * 0.28, 4);
  setFillColor(accentLine, COLORS[1]);
  accentLine.stroked = false;
  accentLine.name = "Accent_Line";

  // ── Headline ──────────────────────────────────────────────────────────────
  var headline = layer.textFrames.add();
  headline.name = "Headline";
  headline.contents = "${topic.substring(0, 35).toUpperCase()}";
  headline.position = [W * 0.08, H * 0.58];
  headline.textRange.characterAttributes.size = 72;
  headline.textRange.characterAttributes.textFont = app.textFonts.getByName("SpaceGrotesk-Bold") || app.textFonts[0];
  setFillColor(headline, new RGBColor());
  headline.textRange.characterAttributes.fillColor.red   = 255;
  headline.textRange.characterAttributes.fillColor.green = 255;
  headline.textRange.characterAttributes.fillColor.blue  = 255;

  // ── Sub-copy ─────────────────────────────────────────────────────────────
  var subText = layer.textFrames.add();
  subText.name = "Sub_Copy";
  subText.contents = "${blueprint.strategy.substring(0, 80)}";
  subText.position = [W * 0.08, H * 0.66];
  subText.textRange.characterAttributes.size = 22;

  // ── Bottom Brand Bar ──────────────────────────────────────────────────────
  var brandBar = layer.pathItems.rectangle(H * 0.08, 0, W, 8);
  setFillColor(brandBar, COLORS[1]);
  brandBar.stroked = false;
  brandBar.name = "Brand_Bar";

  // ── Save for Web ─────────────────────────────────────────────────────────
  var exportOpts = new ExportOptionsPNG24();
  exportOpts.horizontalScale = 100;
  exportOpts.verticalScale   = 100;
  exportOpts.antiAliasing    = true;
  doc.exportFile(new File("/tmp/BoldLayers_InstaPost.png"), ExportType.PNG24, exportOpts);

  $.writeln("Bold Layers: '${topic}' — ${d.label} created.");
  $.writeln("Canvas: " + W + "×" + H + "px | Layers: " + doc.layers.length);
})();
`;
}

// ── SVG Preview Generator (platform-aware) ────────────────────────────────────
function generateSVGPreview(blueprint: Blueprint): string {
  const colors = blueprint.colorPalette;
  const bg     = colors[0] ?? '#0D0F1A';
  const accent = colors[1] ?? '#6366F1';
  const light  = colors[2] ?? '#F8FAFF';
  const d      = PLATFORM_DELIVERABLE[blueprint.platform];

  const ab = blueprint.artboards[0];
  const W = ab?.width ?? d.artboard.w;
  const H = ab?.height ?? d.artboard.h;

  // Compute preview aspect ratio (max 800 wide)
  const ratio   = Math.min(800 / W, 450 / H);
  const pw = Math.round(W * ratio);
  const ph = Math.round(H * ratio);

  const isVertical = H > W; // Reel
  const is3D       = blueprint.platform === 'blender';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pw} ${ph}" width="${pw}" height="${ph}">
  <defs>
    <linearGradient id="bg-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg}"/>
      <stop offset="100%" style="stop-color:${bg}CC"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="4" result="cb"/><feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <radialGradient id="sphere-g" cx="40%" cy="35%" r="55%"><stop offset="0%" style="stop-color:${accent};stop-opacity:0.8"/><stop offset="100%" style="stop-color:${accent};stop-opacity:0.1"/></radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${pw}" height="${ph}" fill="url(#bg-g)"/>

  ${is3D ? `
  <!-- 3D Scene preview -->
  <ellipse cx="${pw*0.5}" cy="${ph*0.72}" rx="${pw*0.45}" ry="${ph*0.06}" fill="${accent}" opacity="0.1"/>
  <circle cx="${pw*0.5}" cy="${ph*0.42}" r="${pw*0.24}" fill="url(#sphere-g)" filter="url(#glow)"/>
  <circle cx="${pw*0.5}" cy="${ph*0.42}" r="${pw*0.24}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.3"/>
  <!-- Steam particles -->
  ${Array.from({ length: 12 }, (_, i) => `<circle cx="${pw*0.5 + (Math.sin(i) * pw * 0.08)}" cy="${ph*(0.18 - i*0.012)}" r="${1.5 + i%3}" fill="${light}" opacity="${0.06 + i * 0.02}"/>`).join('')}
  <!-- Key light effect -->
  <ellipse cx="${pw*0.3}" cy="${ph*0.2}" rx="${pw*0.15}" ry="${ph*0.08}" fill="${accent}" opacity="0.07"/>
  ` : isVertical ? `
  <!-- Reel preview (9:16) -->
  <rect x="${pw*0.08}" y="${ph*0.12}" width="${pw*0.84}" height="${ph*0.76}" rx="8" fill="${accent}" opacity="0.08"/>
  <!-- Animated line indicator -->
  <rect x="${pw*0.08}" y="${ph*0.12}" width="${pw*0.4}" height="2" rx="1" fill="${accent}" opacity="0.6"/>
  <text x="${pw/2}" y="${ph*0.38}" font-family="Space Grotesk,sans-serif" font-size="${pw*0.072}" font-weight="800" fill="${light}" text-anchor="middle" letter-spacing="-0.5">${blueprint.title.substring(0,16)}</text>
  <rect x="${pw*0.2}" y="${ph*0.43}" width="${pw*0.6}" height="2" rx="1" fill="${accent}" opacity="0.5"/>
  <text x="${pw/2}" y="${ph*0.52}" font-family="Inter,sans-serif" font-size="${pw*0.038}" fill="${light}" text-anchor="middle" opacity="0.5">30s · 1080×1920</text>
  <!-- Timeline bar -->
  <rect x="${pw*0.08}" y="${ph*0.82}" width="${pw*0.84}" height="6" rx="3" fill="${light}" opacity="0.08"/>
  <rect x="${pw*0.08}" y="${ph*0.82}" width="${pw*0.35}" height="6" rx="3" fill="${accent}" opacity="0.6"/>
  ` : `
  <!-- Poster / Flyer / Illustrator preview -->
  <rect x="${pw*0.06}" y="${ph*0.55}" width="${pw*0.25}" height="3" rx="1.5" fill="${accent}" filter="url(#glow)"/>
  <text x="${pw*0.06}" y="${ph*0.48}" font-family="Space Grotesk,sans-serif" font-size="${pw * 0.072}" font-weight="800" fill="${light}" letter-spacing="-0.5">${blueprint.title.substring(0,18)}</text>
  <rect x="${pw*0.06}" y="${ph*0.62}" width="${pw*0.55}" height="9" rx="4.5" fill="${light}" opacity="0.12"/>
  <rect x="${pw*0.06}" y="${ph*0.74}" width="${pw*0.45}" height="9" rx="4.5" fill="${light}" opacity="0.08"/>
  <rect x="${pw*0.06}" y="${ph*0.86}" width="${pw*0.35}" height="9" rx="4.5" fill="${light}" opacity="0.06"/>
  `}

  <!-- Grid lines -->
  <g opacity="0.04" stroke="${light}" stroke-width="0.5">
    <line x1="0" y1="${ph*0.33}" x2="${pw}" y2="${ph*0.33}"/>
    <line x1="0" y1="${ph*0.66}" x2="${pw}" y2="${ph*0.66}"/>
    <line x1="${pw*0.33}" y1="0" x2="${pw*0.33}" y2="${ph}"/>
    <line x1="${pw*0.66}" y1="0" x2="${pw*0.66}" y2="${ph}"/>
  </g>

  <!-- Colour palette dots -->
  ${colors.slice(0,4).map((c, i) => `<circle cx="${pw - 16 - i*20}" cy="${ph - 14}" r="6" fill="${c}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>`).join('')}

  <!-- Deliverable badge -->
  <rect x="${pw*0.06}" y="${ph - 28}" width="${d.label.length * 7 + 16}" height="18" rx="9" fill="${accent}" opacity="0.2"/>
  <text x="${pw*0.06 + 8}" y="${ph - 14}" font-family="Space Grotesk,sans-serif" font-size="10" fill="${accent}" font-weight="600" letter-spacing="0.5">${d.label.toUpperCase()}</text>

  <!-- Bold Layers watermark -->
  <text x="${pw - 8}" y="${ph - 8}" font-family="Space Grotesk,sans-serif" font-size="8" fill="${light}" opacity="0.2" text-anchor="end" font-weight="700" letter-spacing="2">BOLD LAYERS</text>
</svg>`;
}

// ── Magic Layer Analysis ──────────────────────────────────────────────────────
export interface MagicLayer {
  id: string;
  type: 'background' | 'image-zone' | 'text' | 'logo' | 'overlay' | 'shape';
  label: string;
  content?: string;           // text content (for type=text)
  color?: string;             // bg color, overlay color, text color
  fontSize?: number;          // % of canvas height
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  zone: { x: number; y: number; w: number; h: number }; // % values 0–100
  locked?: boolean;           // background is locked by default
  editable: boolean;
}

export interface MagicLayerResult {
  brand: string;
  category: string;
  primaryColor: string;
  accentColor: string;
  layers: MagicLayer[];
}

async function generateWithGeminiVision(imageUrl: string, prompt: string): Promise<string> {
  if (!API_KEY) throw new Error('No API key');
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  // Fetch image and convert to base64
  const resp = await fetch(imageUrl);
  const blob = await resp.blob();
  const base64 = await new Promise<string>((res) => {
    const reader = new FileReader();
    reader.onloadend = () => res((reader.result as string).split(',')[1]);
    reader.readAsDataURL(blob);
  });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: blob.type as 'image/png', data: base64 } },
          { text: prompt },
        ],
      },
    ],
  });
  return response.text ?? '';
}

export async function analyzeTemplateForLayers(imageUrl: string, templateName: string): Promise<MagicLayerResult> {
  const prompt = `You are a professional graphic design AI. Analyze this marketing poster image and decompose it into editable layers.

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "brand": "brand name from poster",
  "category": "food|hotel|real-estate|bakery",
  "primaryColor": "#hex",
  "accentColor": "#hex",
  "layers": [
    {
      "id": "bg",
      "type": "background",
      "label": "Background",
      "color": "#hex or gradient description",
      "zone": { "x": 0, "y": 0, "w": 100, "h": 100 },
      "locked": true,
      "editable": false
    },
    {
      "id": "product-image",
      "type": "image-zone",
      "label": "Product / Hero Image",
      "zone": { "x": 10, "y": 15, "w": 80, "h": 50 },
      "editable": true
    },
    {
      "id": "headline",
      "type": "text",
      "label": "Headline",
      "content": "exact text from poster",
      "color": "#hex",
      "fontSize": 5,
      "fontWeight": "800",
      "textAlign": "center",
      "zone": { "x": 5, "y": 68, "w": 90, "h": 10 },
      "editable": true
    }
  ]
}

Rules:
- Identify ALL text elements on the poster with their exact content
- Zone values are percentages (0–100) of the image dimensions
- Always include: background layer, product/hero image zone, all text layers (headline, subheadline, price if visible, tagline, brand name, contact/location if visible)
- Estimate zones accurately based on visual position
- For text, extract the exact text content visible on the poster
- fontWeight: "400" normal, "600" semibold, "700" bold, "800" extrabold, "900" black
- fontSize is approximate % of canvas height (headline ~5-8%, body ~2-3%, small text ~1.5%)`;

  try {
    const raw = await generateWithGeminiVision(imageUrl, prompt);
    const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(json) as MagicLayerResult;
  } catch {
    return getMockMagicLayers(templateName);
  }
}

function getMockMagicLayers(templateName: string): MagicLayerResult {
  const isFood = templateName.toLowerCase().includes('manam') || templateName.toLowerCase().includes('chicken') || templateName.toLowerCase().includes('biryani') || templateName.toLowerCase().includes('cake');
  const isHotel = templateName.toLowerCase().includes('hotel') || templateName.toLowerCase().includes('shore') || templateName.toLowerCase().includes('peak');
  const isRE = templateName.toLowerCase().includes('real') || templateName.toLowerCase().includes('plot') || templateName.toLowerCase().includes('villa') || templateName.toLowerCase().includes('apartment');

  const brandName = isFood ? 'Manam Canteen' : isHotel ? 'Hotel Properties' : isRE ? 'Real Estate' : 'Brand';
  const primary = isFood ? '#8B1A1A' : isHotel ? '#1A3A5C' : isRE ? '#1A4A2E' : '#1a1a2e';
  const accent = isFood ? '#F4A135' : isHotel ? '#D4AF37' : isRE ? '#F39C12' : '#6366F1';

  return {
    brand: brandName,
    category: isFood ? 'food' : isHotel ? 'hotel' : isRE ? 'real-estate' : 'other',
    primaryColor: primary,
    accentColor: accent,
    layers: [
      { id: 'bg', type: 'background', label: 'Background', color: primary, zone: { x: 0, y: 0, w: 100, h: 100 }, locked: true, editable: false },
      { id: 'overlay', type: 'overlay', label: 'Color Overlay', color: 'rgba(0,0,0,0.35)', zone: { x: 0, y: 55, w: 100, h: 45 }, editable: true },
      { id: 'product', type: 'image-zone', label: isFood ? 'Food Hero Image' : isHotel ? 'Property Photo' : 'Property Image', zone: { x: 5, y: 8, w: 90, h: 52 }, editable: true },
      { id: 'headline', type: 'text', label: 'Headline', content: templateName, color: '#FFFFFF', fontSize: 6, fontWeight: '800', textAlign: 'center', zone: { x: 5, y: 62, w: 90, h: 10 }, editable: true },
      { id: 'subtext', type: 'text', label: 'Subheadline', content: isFood ? 'Freshly Made · Home Style' : isHotel ? 'Experience Luxury & Comfort' : 'Premium Properties · Best Locations', color: accent, fontSize: 2.5, fontWeight: '500', textAlign: 'center', zone: { x: 10, y: 74, w: 80, h: 5 }, editable: true },
      { id: 'price', type: 'text', label: isFood ? 'Price / Offer' : 'CTA / Price', content: isFood ? '₹149 Only' : isRE ? 'Call Now: 98765 43210' : 'Book Now · Limited Slots', color: accent, fontSize: 4, fontWeight: '700', textAlign: 'center', zone: { x: 15, y: 80, w: 70, h: 8 }, editable: true },
      { id: 'brand', type: 'text', label: 'Brand Name', content: brandName, color: '#FFFFFF', fontSize: 2.2, fontWeight: '600', textAlign: 'center', zone: { x: 20, y: 90, w: 60, h: 5 }, locked: true, editable: true },
    ],
  };
}
