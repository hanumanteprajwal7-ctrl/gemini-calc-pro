import React, { useState } from 'react';
import { Formula } from '../types.ts';

 const PRESET_FORMULAS: Formula[] = [

  // =========================
  // ALGEBRA
  // =========================

  { id: 'a1', name: 'Quadratic Formula', expression: 'x = (-b ± √(b² - 4ac)) / 2a', category: 'Algebra', description: 'Solves quadratic equations ax² + bx + c = 0.' },
  { id: 'a2', name: 'Difference of Squares', expression: 'a² - b² = (a-b)(a+b)', category: 'Algebra', description: 'Factorization identity.' },
  { id: 'a3', name: 'Square of Sum', expression: '(a+b)² = a² + 2ab + b²', category: 'Algebra', description: 'Expansion of the square of a sum.' },
  { id: 'a4', name: 'Square of Difference', expression: '(a-b)² = a² - 2ab + b²', category: 'Algebra', description: 'Expansion of the square of a difference.' },
  { id: 'a5', name: 'Cube of Sum', expression: '(a+b)³ = a³ + 3a²b + 3ab² + b³', category: 'Algebra', description: 'Expansion of the cube of a sum.' },
  { id: 'a6', name: 'Cube of Difference', expression: '(a-b)³ = a³ - 3a²b + 3ab² - b³', category: 'Algebra', description: 'Expansion of the cube of a difference.' },
  { id: 'a7', name: 'Sum of Cubes', expression: 'a³+b³ = (a+b)(a²-ab+b²)', category: 'Algebra', description: 'Factorization of sum of cubes.' },
  { id: 'a8', name: 'Difference of Cubes', expression: 'a³-b³ = (a-b)(a²+ab+b²)', category: 'Algebra', description: 'Factorization of difference of cubes.' },
  { id: 'a9', name: 'Discriminant', expression: 'D = b² - 4ac', category: 'Algebra', description: 'Determines the nature of quadratic roots.' },
  { id: 'a10', name: 'Log Product Rule', expression: 'log(MN) = logM + logN', category: 'Algebra', description: 'Logarithm of a product.' },
  { id: 'a11', name: 'Log Quotient Rule', expression: 'log(M/N) = logM - logN', category: 'Algebra', description: 'Logarithm of a quotient.' },
  { id: 'a12', name: 'Log Power Rule', expression: 'log(Mⁿ) = n logM', category: 'Algebra', description: 'Logarithm of a power.' },
  { id: 'a13', name: 'Change of Base', expression: 'logₐb = log_cb / log_ca', category: 'Algebra', description: 'Converts logarithms between bases.' },
  { id: 'a14', name: 'Arithmetic nth Term', expression: 'aₙ = a + (n-1)d', category: 'Sequences', description: 'nth term of an arithmetic progression.' },
  { id: 'a15', name: 'Arithmetic Sum', expression: 'Sₙ = n/2[2a+(n-1)d]', category: 'Sequences', description: 'Sum of an arithmetic progression.' },
  { id: 'a16', name: 'Geometric nth Term', expression: 'aₙ = arⁿ⁻¹', category: 'Sequences', description: 'nth term of a geometric progression.' },
  { id: 'a17', name: 'Geometric Sum', expression: 'Sₙ = a(rⁿ-1)/(r-1)', category: 'Sequences', description: 'Finite geometric progression sum.' },
  { id: 'a18', name: 'Infinite GP', expression: 'S∞ = a/(1-r), |r|<1', category: 'Sequences', description: 'Sum of an infinite geometric progression.' },
  { id: 'a19', name: 'Permutation', expression: 'ⁿPᵣ = n!/(n-r)!', category: 'Combinatorics', description: 'Number of ordered arrangements.' },
  { id: 'a20', name: 'Combination', expression: 'ⁿCᵣ = n!/[r!(n-r)!]', category: 'Combinatorics', description: 'Number of selections without order.' },

  // =========================
  // TRIGONOMETRY
  // =========================

  { id: 't1', name: 'Sine Rule', expression: 'a/sinA = b/sinB = c/sinC', category: 'Trigonometry', description: 'Relates sides and angles of a triangle.' },
  { id: 't2', name: 'Cosine Rule', expression: 'c² = a²+b²-2ab cosC', category: 'Trigonometry', description: 'Law of cosines.' },
  { id: 't3', name: 'Pythagorean Identity', expression: 'sin²θ + cos²θ = 1', category: 'Trigonometry', description: 'Fundamental trigonometric identity.' },
  { id: 't4', name: 'Tangent Identity', expression: '1 + tan²θ = sec²θ', category: 'Trigonometry', description: 'Identity involving tangent and secant.' },
  { id: 't5', name: 'Cotangent Identity', expression: '1 + cot²θ = cosec²θ', category: 'Trigonometry', description: 'Identity involving cotangent and cosecant.' },
  { id: 't6', name: 'Sine Addition', expression: 'sin(A+B) = sinA cosB + cosA sinB', category: 'Trigonometry', description: 'Sine compound-angle formula.' },
  { id: 't7', name: 'Sine Subtraction', expression: 'sin(A-B) = sinA cosB - cosA sinB', category: 'Trigonometry', description: 'Sine difference formula.' },
  { id: 't8', name: 'Cosine Addition', expression: 'cos(A+B) = cosA cosB - sinA sinB', category: 'Trigonometry', description: 'Cosine compound-angle formula.' },
  { id: 't9', name: 'Cosine Subtraction', expression: 'cos(A-B) = cosA cosB + sinA sinB', category: 'Trigonometry', description: 'Cosine difference formula.' },
  { id: 't10', name: 'Tangent Addition', expression: 'tan(A+B) = (tanA+tanB)/(1-tanA tanB)', category: 'Trigonometry', description: 'Tangent compound-angle formula.' },
  { id: 't11', name: 'Double Angle Sine', expression: 'sin2θ = 2sinθ cosθ', category: 'Trigonometry', description: 'Double-angle identity.' },
  { id: 't12', name: 'Double Angle Cosine', expression: 'cos2θ = cos²θ - sin²θ', category: 'Trigonometry', description: 'Double-angle cosine identity.' },
  { id: 't13', name: 'Double Angle Tangent', expression: 'tan2θ = 2tanθ/(1-tan²θ)', category: 'Trigonometry', description: 'Double-angle tangent identity.' },
  { id: 't14', name: 'Euler Formula', expression: 'e^(iθ) = cosθ + i sinθ', category: 'Trigonometry', description: 'Connects exponential and trigonometric functions.' },

  // =========================
  // GEOMETRY
  // =========================

  { id: 'g1', name: 'Pythagorean Theorem', expression: 'a² + b² = c²', category: 'Geometry', description: 'Relationship between sides of a right triangle.' },
  { id: 'g2', name: 'Rectangle Area', expression: 'A = l × w', category: 'Geometry', description: 'Area of a rectangle.' },
  { id: 'g3', name: 'Rectangle Perimeter', expression: 'P = 2(l+w)', category: 'Geometry', description: 'Perimeter of a rectangle.' },
  { id: 'g4', name: 'Square Area', expression: 'A = a²', category: 'Geometry', description: 'Area of a square.' },
  { id: 'g5', name: 'Square Perimeter', expression: 'P = 4a', category: 'Geometry', description: 'Perimeter of a square.' },
  { id: 'g6', name: 'Circle Area', expression: 'A = πr²', category: 'Geometry', description: 'Area of a circle.' },
  { id: 'g7', name: 'Circle Circumference', expression: 'C = 2πr', category: 'Geometry', description: 'Circumference of a circle.' },
  { id: 'g8', name: 'Triangle Area', expression: 'A = 1/2 bh', category: 'Geometry', description: 'Area of a triangle.' },
  { id: 'g9', name: 'Heron Formula', expression: 'A = √[s(s-a)(s-b)(s-c)]', category: 'Geometry', description: 'Triangle area when all three sides are known.' },
  { id: 'g10', name: 'Sphere Surface Area', expression: 'SA = 4πr²', category: 'Geometry', description: 'Surface area of a sphere.' },
  { id: 'g11', name: 'Sphere Volume', expression: 'V = 4/3πr³', category: 'Geometry', description: 'Volume of a sphere.' },
  { id: 'g12', name: 'Cylinder Volume', expression: 'V = πr²h', category: 'Geometry', description: 'Volume of a cylinder.' },
  { id: 'g13', name: 'Cylinder Surface Area', expression: 'SA = 2πr(r+h)', category: 'Geometry', description: 'Total surface area of a cylinder.' },
  { id: 'g14', name: 'Cone Volume', expression: 'V = 1/3πr²h', category: 'Geometry', description: 'Volume of a cone.' },
  { id: 'g15', name: 'Cone Curved Surface Area', expression: 'CSA = πrl', category: 'Geometry', description: 'Curved surface area of a cone.' },

  // =========================
  // COORDINATE GEOMETRY
  // =========================

  { id: 'cg1', name: 'Distance Formula', expression: 'd = √[(x₂-x₁)²+(y₂-y₁)²]', category: 'Coordinate Geometry', description: 'Distance between two points.' },
  { id: 'cg2', name: 'Midpoint Formula', expression: 'M = ((x₁+x₂)/2,(y₁+y₂)/2)', category: 'Coordinate Geometry', description: 'Midpoint between two points.' },
  { id: 'cg3', name: 'Slope Formula', expression: 'm = (y₂-y₁)/(x₂-x₁)', category: 'Coordinate Geometry', description: 'Slope of a straight line.' },
  { id: 'cg4', name: 'Slope Intercept Form', expression: 'y = mx+c', category: 'Coordinate Geometry', description: 'Equation of a straight line.' },
  { id: 'cg5', name: 'Point Slope Form', expression: 'y-y₁ = m(x-x₁)', category: 'Coordinate Geometry', description: 'Line equation using a point and slope.' },
  { id: 'cg6', name: 'Circle Equation', expression: '(x-h)²+(y-k)² = r²', category: 'Coordinate Geometry', description: 'Circle with center (h,k).' },

  // =========================
  // CALCULUS
  // =========================

  { id: 'c1', name: 'Power Rule', expression: 'd/dx[xⁿ] = nxⁿ⁻¹', category: 'Calculus', description: 'Derivative of a power function.' },
  { id: 'c2', name: 'Derivative of sin x', expression: 'd/dx(sin x) = cos x', category: 'Calculus', description: 'Derivative of sine.' },
  { id: 'c3', name: 'Derivative of cos x', expression: 'd/dx(cos x) = -sin x', category: 'Calculus', description: 'Derivative of cosine.' },
  { id: 'c4', name: 'Derivative of tan x', expression: 'd/dx(tan x) = sec²x', category: 'Calculus', description: 'Derivative of tangent.' },
  { id: 'c5', name: 'Derivative of eˣ', expression: 'd/dx(eˣ) = eˣ', category: 'Calculus', description: 'Derivative of exponential function.' },
  { id: 'c6', name: 'Derivative of ln x', expression: 'd/dx(ln x) = 1/x', category: 'Calculus', description: 'Derivative of natural logarithm.' },
  { id: 'c7', name: 'Product Rule', expression: '(uv)′ = u′v + uv′', category: 'Calculus', description: 'Derivative of a product.' },
  { id: 'c8', name: 'Quotient Rule', expression: '(u/v)′ = (vu′-uv′)/v²', category: 'Calculus', description: 'Derivative of a quotient.' },
  { id: 'c9', name: 'Chain Rule', expression: 'd/dx[f(g(x))] = f′(g(x))g′(x)', category: 'Calculus', description: 'Derivative of a composite function.' },
  { id: 'c10', name: 'Integral Power Rule', expression: '∫xⁿdx = xⁿ⁺¹/(n+1)+C', category: 'Calculus', description: 'Integration of a power function.' },
  { id: 'c11', name: 'Integral of 1/x', expression: '∫1/x dx = ln|x|+C', category: 'Calculus', description: 'Integral of reciprocal x.' },
  { id: 'c12', name: 'Integral of sin x', expression: '∫sinx dx = -cosx+C', category: 'Calculus', description: 'Integral of sine.' },
  { id: 'c13', name: 'Integral of cos x', expression: '∫cosx dx = sinx+C', category: 'Calculus', description: 'Integral of cosine.' },
  { id: 'c14', name: 'Integration by Parts', expression: '∫u dv = uv - ∫v du', category: 'Calculus', description: 'Integration technique for products.' },
  { id: 'c15', name: 'Taylor Series', expression: 'f(x)=Σ[f⁽ⁿ⁾(a)/n!](x-a)ⁿ', category: 'Calculus', description: 'Taylor series expansion around a.' },
  { id: 'c16', name: 'Maclaurin Series', expression: 'f(x)=Σ[f⁽ⁿ⁾(0)/n!]xⁿ', category: 'Calculus', description: 'Taylor series centered at zero.' },

  // =========================
  // MATRICES
  // =========================

  { id: 'm1', name: '2×2 Determinant', expression: '|A| = ad-bc', category: 'Matrices', description: 'Determinant of a 2×2 matrix.' },
  { id: 'm2', name: '2×2 Matrix Inverse', expression: 'A⁻¹ = 1/(ad-bc)[[d,-b],[-c,a]]', category: 'Matrices', description: 'Inverse of a 2×2 matrix.' },
  { id: 'm3', name: 'Matrix Transpose', expression: '(Aᵀ)ᵢⱼ = Aⱼᵢ', category: 'Matrices', description: 'Transpose of a matrix.' },
  { id: 'm4', name: 'Matrix Product', expression: '(AB)ᵢⱼ = Σ AᵢₖBₖⱼ', category: 'Matrices', description: 'General matrix multiplication rule.' },

  // =========================
  // VECTORS
  // =========================

  { id: 'v1', name: 'Vector Magnitude 2D', expression: '|A| = √(Aₓ²+Aᵧ²)', category: 'Vectors', description: 'Magnitude of a two-dimensional vector.' },
  { id: 'v2', name: 'Vector Magnitude 3D', expression: '|A| = √(Aₓ²+Aᵧ²+A𝓏²)', category: 'Vectors', description: 'Magnitude of a three-dimensional vector.' },
  { id: 'v3', name: 'Dot Product', expression: 'A·B = |A||B|cosθ', category: 'Vectors', description: 'Scalar product of two vectors.' },
  { id: 'v4', name: 'Cross Product Magnitude', expression: '|A×B| = |A||B|sinθ', category: 'Vectors', description: 'Magnitude of vector cross product.' },

  // =========================
  // PROBABILITY
  // =========================

  { id: 'pr1', name: 'Basic Probability', expression: 'P(A)=Favorable outcomes/Total outcomes', category: 'Probability', description: 'Basic probability for equally likely outcomes.' },
  { id: 'pr2', name: 'Complement Rule', expression: 'P(Aᶜ)=1-P(A)', category: 'Probability', description: 'Probability of an event not occurring.' },
  { id: 'pr3', name: 'Addition Rule', expression: 'P(A∪B)=P(A)+P(B)-P(A∩B)', category: 'Probability', description: 'Probability of A or B.' },
  { id: 'pr4', name: 'Conditional Probability', expression: 'P(A|B)=P(A∩B)/P(B)', category: 'Probability', description: 'Probability of A given B.' },
  { id: 'pr5', name: 'Bayes Theorem', expression: 'P(A|B)=P(B|A)P(A)/P(B)', category: 'Probability', description: 'Bayes theorem.' },
  { id: 'pr6', name: 'Independent Events', expression: 'P(A∩B)=P(A)P(B)', category: 'Probability', description: 'Multiplication rule for independent events.' },

  // =========================
  // STATISTICS
  // =========================

  { id: 's1', name: 'Arithmetic Mean', expression: 'x̄ = Σx/n', category: 'Statistics', description: 'Average of observations.' },
  { id: 's2', name: 'Weighted Mean', expression: 'x̄w = Σwx/Σw', category: 'Statistics', description: 'Mean with different weights.' },
  { id: 's3', name: 'Population Variance', expression: 'σ² = Σ(x-μ)²/N', category: 'Statistics', description: 'Population variance.' },
  { id: 's4', name: 'Population Standard Deviation', expression: 'σ = √[Σ(x-μ)²/N]', category: 'Statistics', description: 'Population standard deviation.' },
  { id: 's5', name: 'Coefficient of Variation', expression: 'CV = (σ/μ)×100%', category: 'Statistics', description: 'Relative measure of dispersion.' },
  { id: 's6', name: 'Binomial Probability', expression: 'P(X=r)=ⁿCᵣpʳqⁿ⁻ʳ', category: 'Statistics', description: 'Probability mass function of a binomial distribution.' },

  // =========================
  // PHYSICS
  // =========================

  { id: 'p1', name: 'Newton Second Law', expression: 'F = ma', category: 'Physics', description: 'Force equals mass times acceleration.' },
  { id: 'p2', name: 'Momentum', expression: 'p = mv', category: 'Physics', description: 'Linear momentum.' },
  { id: 'p3', name: 'Kinetic Energy', expression: 'KE = 1/2 mv²', category: 'Physics', description: 'Energy due to motion.' },
  { id: 'p4', name: 'Potential Energy', expression: 'PE = mgh', category: 'Physics', description: 'Gravitational potential energy.' },
  { id: 'p5', name: 'Work', expression: 'W = Fd cosθ', category: 'Physics', description: 'Work done by a force.' },
  { id: 'p6', name: 'Power', expression: 'P = W/t', category: 'Physics', description: 'Rate of doing work.' },
  { id: 'p7', name: 'Wave Equation', expression: 'v = fλ', category: 'Physics', description: 'Relationship between wave speed, frequency and wavelength.' },
  { id: 'p8', name: 'Mass-Energy Equivalence', expression: 'E = mc²', category: 'Physics', description: 'Mass-energy equivalence.' },
  { id: 'p9', name: 'Universal Gravitation', expression: 'F = Gm₁m₂/r²', category: 'Physics', description: 'Gravitational force between two masses.' },
  { id: 'p10', name: 'Coulomb Law', expression: 'F = kq₁q₂/r²', category: 'Physics', description: 'Electrostatic force between charges.' },
  { id: 'p11', name: 'Ohm Law', expression: 'V = IR', category: 'Electrical', description: 'Relationship between voltage, current and resistance.' },
  { id: 'p12', name: 'Electrical Power', expression: 'P = VI = I²R = V²/R', category: 'Electrical', description: 'Electrical power formulas.' },
  { id: 'p13', name: 'Charge', expression: 'Q = It', category: 'Electrical', description: 'Electric charge from current and time.' },
  { id: 'p14', name: 'Capacitor Charge', expression: 'Q = CV', category: 'Electrical', description: 'Charge stored in a capacitor.' },
  { id: 'p15', name: 'Capacitor Energy', expression: 'U = 1/2 CV²', category: 'Electrical', description: 'Energy stored in a capacitor.' },
  { id: 'p16', name: 'Transformer EMF Ratio', expression: 'Vₚ/Vₛ = Nₚ/Nₛ', category: 'Electrical', description: 'Ideal transformer voltage ratio.' },

  // =========================
  // COMPUTER SCIENCE
  // =========================

  { id: 'cs1', name: 'Binary to Decimal', expression: 'Decimal = Σ(bit × 2ⁿ)', category: 'Computer Science', description: 'General binary-to-decimal conversion.' },
  { id: 'cs2', name: 'Data Transfer Rate', expression: 'Rate = Data / Time', category: 'Computer Science', description: 'Basic data transfer rate.' },
  { id: 'cs3', name: 'CPU Execution Time', expression: 'CPU Time = Instruction Count × CPI × Clock Cycle Time', category: 'Computer Science', description: 'Basic CPU performance equation.' },
  { id: 'cs4', name: 'Clock Cycle Time', expression: 'Cycle Time = 1 / Clock Rate', category: 'Computer Science', description: 'Time for one CPU clock cycle.' },
  { id: 'cs5', name: 'Amdahl Law', expression: 'Speedup = 1 / [(1-P)+P/S]', category: 'Computer Science', description: 'Estimates speedup from improving part of a system.' },

];
interface FormulaLabProps {
  onSelectFormula: (expression: string) => void;
}

export const FormulaLab: React.FC<FormulaLabProps> = ({ onSelectFormula }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', ...new Set(PRESET_FORMULAS.map(f => f.category))];

  const filtered = PRESET_FORMULAS.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                         f.expression.toLowerCase().includes(search.toLowerCase()) ||
                         f.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || f.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (formula: Formula) => {
    navigator.clipboard.writeText(formula.expression);
    setCopiedId(formula.id);
    setTimeout(() => {
      setCopiedId(prev => prev === formula.id ? null : prev);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full overflow-hidden">
        
        {/* Header and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Formula Library</h2>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Browsing {filtered.length} Essential Concepts</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              <input 
                type="text"
                placeholder="Search formulas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Formula Grid Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar min-h-0 pr-2 pb-12">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-40">
              <i className="fas fa-search text-6xl"></i>
              <p className="text-lg font-bold">No results found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(f => (
                <div 
                  key={f.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/40 transition-all group flex flex-col shadow-lg h-full"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-blue-500/10">
                      {f.category}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-100 mb-1 group-hover:text-blue-400 transition-colors">
                    {f.name}
                  </h3>
                  
                  <div className="bg-slate-950/50 rounded-xl p-3 mb-3 border border-slate-800/50 font-mono text-emerald-400 text-sm flex items-center justify-center text-center shadow-inner overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {f.expression}
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-grow line-clamp-3">
                    {f.description}
                  </p>

                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={() => handleCopy(f)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        copiedId === f.id
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      <i className={`fas ${copiedId === f.id ? 'fa-check' : 'fa-copy'}`}></i>
                      {copiedId === f.id ? 'Copied!' : 'Copy'}
                    </button>
                    <button 
                      onClick={() => onSelectFormula(f.expression)}
                      className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-blue-500/20 transition-all"
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};