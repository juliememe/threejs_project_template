import * as THREE from 'three';

import init from './init';
import Stats from 'stats.js';
import './style.css';
import GUI from 'lil-gui';

const { sizes, camera, scene, canvas, controls, renderer } = init();

const gui = new GUI({ closeFolders: true }); //создаем настройки со свернутыми папками

camera.position.z = 3;
const defaultColor = {
	color: 'red',
};

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
	color: defaultColor.color,
	wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
// gui.add(mesh.scale, 'x', 0, 5, 0.2); // настриваем контрол для конкретного элемента

const scaleFolder = gui.addFolder('Scale');
scaleFolder.add(mesh.scale, 'x').min(0).max(5).step(0.2).name('Box scale'); // тоже самое что сверху
scaleFolder.add(mesh.scale, 'y').min(0).max(5).step(0.2).name('Box scale'); // тоже самое что сверху
scaleFolder.add(mesh.scale, 'z').min(0).max(5).step(0.2).name('Box scale'); // тоже самое что сверху

gui.add(mesh, 'visible');
gui.add(material, 'wireframe');
gui.add(material, 'vertexColors');
gui.addColor(defaultColor, 'color').onChange(() =>
	material.color.set(defaultColor.color),
);
scene.add(mesh);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.domElement);

const tick = () => {
	stats.begin(); //начинаем отсчет фпс
	controls.update();
	renderer.render(scene, camera);
	stats.end(); // конец отсчета фпс
	window.requestAnimationFrame(tick);
};
tick();

/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener('resize', () => {
	// Обновляем размеры
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Обновляем соотношение сторон камеры
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Обновляем renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
});

window.addEventListener('dblclick', () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});
