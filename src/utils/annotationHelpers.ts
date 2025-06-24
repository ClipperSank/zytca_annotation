import type { Annotation, Point } from '../types';

export const calculateRadius = (start: Point, end: Point): number => {
  return Math.sqrt(
    Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2)
  );
};

export const isValidAnnotation = (radius: number, minRadius: number = 2e-6): boolean => {
  return radius > minRadius;
};

export const createCirclePath = (
  paper: any,
  center: any,
  radius: number,
  isSelected: boolean = false,
  annotationId: number
) => {
  return new paper.Path.Circle({
    center,
    radius,
    strokeColor: isSelected ? 'yellow' : 'red',
    strokeWidth: isSelected ? 4 : 2,
    data: { annotationId }
  });
};

export const createTempCircle = (paper: any, center: any, radius: number) => {
  return new paper.Path.Circle({
    center,
    radius,
    strokeColor: 'red',
    strokeWidth: 2,
    dashArray: [6, 6]
  });
};