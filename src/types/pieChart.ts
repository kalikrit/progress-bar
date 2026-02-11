export interface Sector {
  id: number
  name: string
  percentage: number
  color: string
}

export interface SectorWithAngles extends Sector {
  startAngle: number
  endAngle: number
  angle: number
}

export interface SectorFormData {
  id: number | null
  name: string
  percentage: string | number
  color: string
}