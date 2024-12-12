import * as THREE from 'three';
import { Tween, Group, Easing } from '@tweenjs/tween.js';
import init from './init';

import './style.css';

const { sizes, camera, scene, canvas, controls, renderer } = init();

camera.position.z = 30;

const group = new THREE.Group();
const geometries = [
	new THREE.BoxGeometry(1, 1, 1),
	new THREE.CylinderGeometry(0.5, 1, 2, 16, 4),
	new THREE.ConeGeometry(1, 2, 32, 1),
	new THREE.RingGeometry(0.5, 1, 16),
	new THREE.TorusGeometry(1, 0.5, 16, 100),
	new THREE.DodecahedronGeometry(1, 0),
	new THREE.SphereGeometry(1, 32, 16),
	new THREE.TorusKnotGeometry(1, 0.25, 100, 16, 1, 5),
	new THREE.OctahedronGeometry(1, 0),
];

let index = 0;
let activeIndex = -1;

for (let i = -5; i <= 5; i += 5) {
	for (let j = -5; j <= 5; j += 5) {
		const material = new THREE.MeshBasicMaterial({
			color: 'gray',
			wireframe: true,
		});

		const mesh = new THREE.Mesh(geometries[index], material);
		mesh.position.set(i, j, 10);
		mesh.index = index;
		mesh.basePosition = new THREE.Vector3(i, j, 10);
		group.add(mesh);
		index += 1;
	}
}

scene.add(group);

const tweenGroup = new Group(); // Группа для управления твинами

const raycaster = new THREE.Raycaster(); // Отслеживание кликов на объектах
const pointer = new THREE.Vector2(); // Нормализованные координаты мыши

const resetActive = () => {
	if (activeIndex >= 0) {
		const activeMesh = group.children[activeIndex];
		activeMesh.material.color.set('gray');
		new Tween(activeMesh.position, tweenGroup)
			.to(
				{
					x: activeMesh.basePosition.x,
					y: activeMesh.basePosition.y,
					z: activeMesh.basePosition.z,
				},
				1000,
			)
			.easing(Easing.Exponential.InOut)
			.start();
		activeIndex = -1;
	}
};

const handleClick = (event) => {
	// Вычисление нормализованных координат мыши
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

	// Обновление raycaster с учетом камеры и координат указателя
	raycaster.setFromCamera(pointer, camera);

	// Сброс предыдущего выделения
	resetActive();

	// Пересечение объектов
	const intersections = raycaster.intersectObjects(group.children);
	if (intersections.length > 0) {
		const selected = intersections[0].object;
		selected.material.color.set('purple');
		activeIndex = selected.index;

		new Tween(selected.position, tweenGroup)
			.to({ x: 0, y: 0, z: 25 }, 1000)
			.easing(Easing.Exponential.InOut)
			.start();
	}
};

window.addEventListener('click', handleClick);

const clock = new THREE.Clock();

const tick = () => {
	const delta = clock.getDelta();

	// Вращение активного объекта
	if (activeIndex >= 0) {
		group.children[activeIndex].rotation.y += delta * 0.5;
	}

	// Обновление всех твинов через группу
	tweenGroup.update();

	// Отрисовка сцены
	controls.update();
	renderer.render(scene, camera);

	window.requestAnimationFrame(tick);
};
tick();

/** Базовые обработчики событий для поддержки ресайза */
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
