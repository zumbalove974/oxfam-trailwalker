<template></template>

<script>

import Menubar from 'primevue/menubar';

export default {
    components: {

    },
    data() {
        return {
            devices: [],
            visu_function: null,
            dimension: 2,
            line3d: null,
            line: null,
            controller: null,
            visu_meshes: [],
            mesh: null
        }
    },
    methods: {
        async addItineraireSpeed3D(deviceNumbers) {

            this.devices = deviceNumbers;
            const device = this.devices[0];
            this.visu_function = addItineraireSpeed3D;

            const data = await getLiveDataDevice(device);

            let speeds = [];

            for (let i = 0; i < data.length; i++) {
                speeds.push(data[i].speed);
            }

            let min = Math.min(...speeds);
            let max = Math.max(...speeds);

            /* Normalisation des vitesses pour les utiliser dans les couleurs */
            for (let i = 0; i < speeds.length; i++) {
                speeds[i] = (speeds[i] - min) / (max - min);
            }

            if (this.dimension == 2) {
                const points = createPoints2D(data, 0);
                const colors = createColors2D(speeds);

                this.line3d = createLineColor(points, colors);
                this.line3d.computeLineDistances();

                this.controller.threeViewer.scene.remove(this.line);

                this.visu_meshes.push(this.line3d);

                // add line to scene so it can be rendered
                this.controller.threeViewer.scene.add(line3d);
            } else {

                let geometry = new THREE.BufferGeometry();
                // create a simple square shape. We duplicate the top left and bottom right
                // vertices because each vertex needs to appear once per triangle.
                let vertices = [];
                let colors = [];
                const maxZ = 50;

                for (let i = 0; i < (data.length - 1); i++) {
                    //Face 1
                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(data[i].speed / max * maxZ);

                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(0);

                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(0);

                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(0);

                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(data[i + 1].speed / max * maxZ);

                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(data[i].speed / max * maxZ);

                    // Face 2
                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(data[i].speed / max * maxZ);

                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(0);

                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(0);

                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(0);

                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(data[i].speed / max * maxZ);

                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(data[i + 1].speed / max * maxZ);
                }

                for (let i = 0; i < (data.length - 1); i++) {
                    // Face 1
                    colors.push(1 - speeds[i]);
                    colors.push(speeds[i]);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1 - speeds[i + 1]);
                    colors.push(speeds[i + 1]);
                    colors.push(0.2);

                    colors.push(1 - speeds[i]);
                    colors.push(speeds[i]);
                    colors.push(0.2);

                    //Face 2
                    colors.push(1 - speeds[i]);
                    colors.push(speeds[i]);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1 - speeds[i]);
                    colors.push(speeds[i]);
                    colors.push(0.2);

                    colors.push(1 - speeds[i + 1]);
                    colors.push(speeds[i + 1]);
                    colors.push(0.2);
                }

                // itemSize = 3 because there are 3 values (components) per vertex
                geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

                // create material
                const material = new THREE.MeshBasicMaterial({
                    vertexColors: true,
                    transparent: true,
                    opacity: 0.8
                });

                mesh = new THREE.Mesh(geometry, material);

                visu_meshes.push(mesh);

                controller.threeViewer.scene.add(mesh);
            }

            return [min, max];
        }
    }
};
</script>