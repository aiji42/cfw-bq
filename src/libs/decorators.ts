export const experimental = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
	const originalMethod = descriptor.value;
	const className = target.constructor.name;

	descriptor.value = function (...args: any[]) {
		console.log(`⚠️ [EXPERIMENTAL] ${className}.${propertyKey} is experimental and its interface may change in the future.`);
		return originalMethod.apply(this, args);
	};

	return descriptor;
};
