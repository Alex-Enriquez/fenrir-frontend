import { forwardRef } from 'react'
import {
  ArrowLeft as PhArrowLeft,
  ArrowUUpLeft as PhArrowUUpLeft,
  ArrowsDownUp as PhArrowsDownUp,
  Buildings as PhBuildings,
  Calculator as PhCalculator,
  Certificate as PhCertificate,
  Check as PhCheck,
  CheckCircle as PhCheckCircle,
  ClipboardText as PhClipboardText,
  ClockCounterClockwise as PhClockCounterClockwise,
  Confetti as PhConfetti,
  Copy as PhCopy,
  Cpu as PhCpu,
  Crown as PhCrown,
  CurrencyCircleDollar as PhCurrencyCircleDollar,
  Desktop as PhDesktop,
  DeviceMobile as PhDeviceMobile,
  DotsSixVertical as PhDotsSixVertical,
  DownloadSimple as PhDownloadSimple,
  Envelope as PhEnvelope,
  Eye as PhEye,
  EyeSlash as PhEyeSlash,
  FileText as PhFileText,
  FileXls as PhFileXls,
  FloppyDisk as PhFloppyDisk,
  Gear as PhGear,
  Globe as PhGlobe,
  GridFour as PhGridFour,
  GridNine as PhGridNine,
  HardDrive as PhHardDrive,
  HardDrives as PhHardDrives,
  Image as PhImage,
  Key as PhKey,
  Laptop as PhLaptop,
  Layout as PhLayout,
  Lightbulb as PhLightbulb,
  List as PhList,
  ListChecks as PhListChecks,
  Lock as PhLock,
  MagicWand as PhMagicWand,
  MagnifyingGlass as PhMagnifyingGlass,
  Megaphone as PhMegaphone,
  Memory as PhMemory,
  Moon as PhMoon,
  Package as PhPackage,
  PenNib as PhPenNib,
  PencilSimple as PhPencilSimple,
  Phone as PhPhone,
  PhoneCall as PhPhoneCall,
  Plus as PhPlus,
  Question as PhQuestion,
  Receipt as PhReceipt,
  Repeat as PhRepeat,
  SealCheck as PhSealCheck,
  ShieldCheck as PhShieldCheck,
  SignOut as PhSignOut,
  SquaresFour as PhSquaresFour,
  Star as PhStar,
  Sun as PhSun,
  Trash as PhTrash,
  TreeStructure as PhTreeStructure,
  TrendUp as PhTrendUp,
  Truck as PhTruck,
  UploadSimple as PhUploadSimple,
  User as PhUser,
  UserCheck as PhUserCheck,
  UsersThree as PhUsersThree,
  Warehouse as PhWarehouse,
  Warning as PhWarning,
  WarningCircle as PhWarningCircle,
  Wrench as PhWrench,
  X as PhX,
  XCircle as PhXCircle,
  CaretRight as PhCaretRight,
  ArrowRight as PhArrowRight,
  ArrowsClockwise as PhArrowsClockwise,
  UserMinus as PhUserMinus,
  CalendarBlank as PhCalendarBlank,
  Printer as PhPrinter,
  DeviceTablet as PhDeviceTablet,
  Monitor as PhMonitor,
} from '@phosphor-icons/react'

// Íconos de Fenrir. Un solo punto de cambio para todo el sistema: cada pantalla importa de aquí (con los mismos
// nombres de siempre) y el estilo del ícono se decide en este archivo.
//  - A tamaño grande (20 px o más) se dibuja en dos tonos (duotone); en botones y tablas, en trazo firme (bold).
//  - Si se pide relleno (fill="..."), se usa la versión rellena (por ejemplo, las estrellas de calificación).
//  - Se puede forzar el estilo con la propiedad weight ("thin", "light", "regular", "bold", "fill", "duotone").
function hacer(Icono, nombre) {
  const Envuelto = forwardRef(function IconoFenrir({ size = 16, color = 'currentColor', weight, fill, strokeWidth, absoluteStrokeWidth, ...resto }, ref) {
    void strokeWidth; void absoluteStrokeWidth
    const peso = weight || (fill && fill !== 'none' ? 'fill' : (typeof size === 'number' && size >= 20 ? 'duotone' : 'bold'))
    return <Icono ref={ref} size={size} color={color} weight={peso} {...resto} />
  })
  Envuelto.displayName = nombre
  return Envuelto
}

export const AlertCircle = hacer(PhWarningCircle, 'AlertCircle')
export const AlertTriangle = hacer(PhWarning, 'AlertTriangle')
export const ArrowLeft = hacer(PhArrowLeft, 'ArrowLeft')
export const ArrowUpDown = hacer(PhArrowsDownUp, 'ArrowUpDown')
export const BadgeCheck = hacer(PhSealCheck, 'BadgeCheck')
export const Building2 = hacer(PhBuildings, 'Building2')
export const Calculator = hacer(PhCalculator, 'Calculator')
export const Check = hacer(PhCheck, 'Check')
export const CheckCircle2 = hacer(PhCheckCircle, 'CheckCircle2')
export const CircleDollarSign = hacer(PhCurrencyCircleDollar, 'CircleDollarSign')
export const ClipboardList = hacer(PhClipboardText, 'ClipboardList')
export const Copy = hacer(PhCopy, 'Copy')
export const Cpu = hacer(PhCpu, 'Cpu')
export const Crown = hacer(PhCrown, 'Crown')
export const Download = hacer(PhDownloadSimple, 'Download')
export const Eye = hacer(PhEye, 'Eye')
export const EyeOff = hacer(PhEyeSlash, 'EyeOff')
export const FileBadge = hacer(PhCertificate, 'FileBadge')
export const FileSpreadsheet = hacer(PhFileXls, 'FileSpreadsheet')
export const FileText = hacer(PhFileText, 'FileText')
export const Globe = hacer(PhGlobe, 'Globe')
export const Grid3x3 = hacer(PhGridNine, 'Grid3x3')
export const GripVertical = hacer(PhDotsSixVertical, 'GripVertical')
export const HardDrive = hacer(PhHardDrive, 'HardDrive')
export const HelpCircle = hacer(PhQuestion, 'HelpCircle')
export const History = hacer(PhClockCounterClockwise, 'History')
export const Image = hacer(PhImage, 'Image')
export const KeyRound = hacer(PhKey, 'KeyRound')
export const Laptop = hacer(PhLaptop, 'Laptop')
export const Layout = hacer(PhLayout, 'Layout')
export const LayoutDashboard = hacer(PhSquaresFour, 'LayoutDashboard')
export const LayoutGrid = hacer(PhGridFour, 'LayoutGrid')
export const Lightbulb = hacer(PhLightbulb, 'Lightbulb')
export const List = hacer(PhList, 'List')
export const ListChecks = hacer(PhListChecks, 'ListChecks')
export const Lock = hacer(PhLock, 'Lock')
export const LogOut = hacer(PhSignOut, 'LogOut')
export const Mail = hacer(PhEnvelope, 'Mail')
export const Megaphone = hacer(PhMegaphone, 'Megaphone')
export const MemoryStick = hacer(PhMemory, 'MemoryStick')
export const Monitor = hacer(PhDesktop, 'Monitor')
export const Moon = hacer(PhMoon, 'Moon')
export const Network = hacer(PhTreeStructure, 'Network')
export const Package = hacer(PhPackage, 'Package')
export const PartyPopper = hacer(PhConfetti, 'PartyPopper')
export const PenTool = hacer(PhPenNib, 'PenTool')
export const Pencil = hacer(PhPencilSimple, 'Pencil')
export const Phone = hacer(PhPhone, 'Phone')
export const PhoneCall = hacer(PhPhoneCall, 'PhoneCall')
export const Plus = hacer(PhPlus, 'Plus')
export const Receipt = hacer(PhReceipt, 'Receipt')
export const Repeat = hacer(PhRepeat, 'Repeat')
export const Save = hacer(PhFloppyDisk, 'Save')
export const Search = hacer(PhMagnifyingGlass, 'Search')
export const Server = hacer(PhHardDrives, 'Server')
export const Settings = hacer(PhGear, 'Settings')
export const ShieldCheck = hacer(PhShieldCheck, 'ShieldCheck')
export const Smartphone = hacer(PhDeviceMobile, 'Smartphone')
export const Star = hacer(PhStar, 'Star')
export const Sun = hacer(PhSun, 'Sun')
export const Trash2 = hacer(PhTrash, 'Trash2')
export const TrendingUp = hacer(PhTrendUp, 'TrendingUp')
export const Truck = hacer(PhTruck, 'Truck')
export const Undo2 = hacer(PhArrowUUpLeft, 'Undo2')
export const Upload = hacer(PhUploadSimple, 'Upload')
export const User = hacer(PhUser, 'User')
export const UserCheck = hacer(PhUserCheck, 'UserCheck')
export const Users = hacer(PhUsersThree, 'Users')
export const Wand2 = hacer(PhMagicWand, 'Wand2')
export const Warehouse = hacer(PhWarehouse, 'Warehouse')
export const Wrench = hacer(PhWrench, 'Wrench')
export const X = hacer(PhX, 'X')
export const XCircle = hacer(PhXCircle, 'XCircle')

// Íconos que usa solo la interfaz nueva
export const CaretRight = hacer(PhCaretRight, 'CaretRight')
export const ArrowRight = hacer(PhArrowRight, 'ArrowRight')
export const ArrowsClockwise = hacer(PhArrowsClockwise, 'ArrowsClockwise')
export const UserMinus = hacer(PhUserMinus, 'UserMinus')
export const CalendarBlank = hacer(PhCalendarBlank, 'CalendarBlank')
export const Warning = hacer(PhWarning, 'Warning')
export const Printer = hacer(PhPrinter, 'Printer')
export const Tablet = hacer(PhDeviceTablet, 'Tablet')
export const Display = hacer(PhMonitor, 'Display')
