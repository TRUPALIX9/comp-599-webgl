# WebGL Seminar Showcase

This folder contains two runnable WebGL projects built from the seminar sources:

- `city-roaming/` shows browser-native 3D city rendering with glTF-style asset thinking, view-frustum culling, GPU depth/back-face culling, tile cache state, and predicted prefetch queues.
- `situation-display/` shows a service-style 2D/3D situation display with synchronized layers, a live data bus, terrain, entities, replay, and measurement overlays.

Open each `index.html` directly in a browser, or serve the folder with a static server. No package install is required.

## Source Synthesis

The source papers line up into a clean technical arc:

1. **3D ITS Campus on the Web: A WebGL Implementation**
   - WebGL and Three.js made a browser-based campus information system possible without proprietary plugins.
   - The prototype used Blender-built campus assets, `.obj` and `.mtl` models, first-person camera control, ground/free navigation modes, clickable building information markers, and JSON-backed metadata.
   - Its reported usability test had 12 participants, with 83% able to view the 3D campus on their own computers.
   - The practical lesson is that WebGL improves accessibility and interaction, but asset quality, browser support, and environmental detail still matter.

2. **3D Geographic Scenes Visualization Based on WebGL**
   - Large 3D city scenes stress bandwidth, memory, and GPU throughput.
   - The paper proposes glTF as a WebGL-friendly delivery format because it combines JSON scene metadata, binary buffers, images, and shaders.
   - The system uses server-side scene files, client-side cache management, trajectory-based prefetching, view-frustum culling, occlusion/back-face visibility logic, and Cesium/WebGL rendering.
   - In the New York case, the scene contained 765 models, 354,249 polygons, and 549,702 vertices. Conversion reduced storage from 35.6 MB to 27.7 MB. The platform reported first response under 3 seconds, average response under 1 second, and about 36 fps.

3. **Design of a 2D and 3D Situation Display Platform Based on WebGL and Modern Web Technology Stack**
   - WebGL becomes part of a larger operational platform rather than a standalone renderer.
   - The architecture uses infrastructure, data storage, service, and application interaction layers, with WebSocket-style data service interfaces, Spring Boot, Java services, Cesium 3D, ThreeJS, Vue, WebGL2, HTML5, and CSS.
   - The platform emphasizes 2D/3D linkage, scenario construction, situation display, model management, map management, measurement, plotting, base-map switching, and deployability across standard servers, portable servers, and standalone environments.
   - The practical lesson is that serious WebGL systems need data services, modular architecture, layer controls, and operational workflows around the render surface.

## Demo Mapping

The projects are intentionally mapped to the claims above:

- **City Roaming Lab** maps to the WebGL geographic visualization paper. It makes culling and prefetching visible through live metrics and tile states instead of hiding the performance system.
- **Situation Display Lab** maps to the modern 2D/3D platform paper. It shows the browser as an operational display that combines a 3D terrain view, a synchronized 2D map, live entities, layer toggles, replay, and service counters.

## Presentation Use

Use the demos as live evidence during the PPT:

- Open `city-roaming/index.html` when discussing glTF, scene tiling, culling, and predictive prefetch.
- Open `situation-display/index.html` when discussing SOA, 2D/3D linkage, real-time data, and decision-support views.
