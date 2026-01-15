import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { StudentScore } from '../types/questionnaire';
import { Plus, Award, TrendingUp, Users, BarChart3, Star, Medal, Trophy, Crown, Sparkles, Eye } from 'lucide-react';

interface ResultsDashboardProps {
  studentScores: StudentScore[];
  onAddNew: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  studentScores,
  onAddNew,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentScore | null>(null);

  // Sort students by total score (descending)
  const sortedStudents = [...studentScores].sort((a, b) => b.totalScore - a.totalScore);
  
  // Get top 100 students (or all if less than 100)
  const topStudents = sortedStudents.slice(0, 100);
  
  // Calculate statistics
  const stats = {
    totalStudents: studentScores.length,
    qualifiedStudents: studentScores.filter(s => s.totalScore >= 70).length,
    averageScore: studentScores.length > 0 
      ? Math.round(studentScores.reduce((sum, s) => sum + s.totalScore, 0) / studentScores.length)
      : 0,
    topScore: studentScores.length > 0 ? Math.max(...studentScores.map(s => s.totalScore)) : 0,
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-500';
    if (score >= 70) return 'from-blue-500 to-cyan-500';
    if (score >= 50) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Qualified';
    if (score >= 50) return 'Potential';
    return 'Needs Support';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    if (rank <= 10) return <Star className="w-4 h-4 text-blue-500" />;
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeInUp">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Students</p>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm animate-float">
                <Users className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              <span className="text-blue-100 text-sm">Assessed so far</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Qualified Students</p>
                <p className="text-3xl font-bold">{stats.qualifiedStudents}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm animate-float animation-delay-200">
                <Award className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Trophy className="w-4 h-4 mr-1" />
              <span className="text-emerald-100 text-sm">Score ≥ 70</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Average Score</p>
                <p className="text-3xl font-bold">{stats.averageScore}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm animate-float animation-delay-400">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <BarChart3 className="w-4 h-4 mr-1" />
              <span className="text-purple-100 text-sm">Out of 100</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">Highest Score</p>
                <p className="text-3xl font-bold">{stats.topScore}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm animate-float animation-delay-600">
                <Crown className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Star className="w-4 h-4 mr-1" />
              <span className="text-amber-100 text-sm">Top performer</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-fadeInUp animation-delay-200">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Student Rankings
          </h2>
          {topStudents.length > 0 && (
            <p className="text-gray-600 mt-1">
              Showing top {Math.min(topStudents.length, 100)} students out of {studentScores.length}
            </p>
          )}
        </div>
        <button
          onClick={onAddNew}
          className="group flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Add New Student
        </button>
      </div>

      {/* Results Section */}
      {topStudents.length === 0 ? (
        <Card className="glass-strong rounded-3xl border-0 shadow-2xl animate-fadeInUp animation-delay-400">
          <CardContent className="p-16 text-center">
            <div className="animate-float">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Students Assessed Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start your journey by conducting the first student assessment. Discover potential and nurture aspirations.
            </p>
            <button
              onClick={onAddNew}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Conduct First Assessment
              <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
            </button>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-strong rounded-3xl border-0 shadow-2xl overflow-hidden animate-fadeInUp animation-delay-400">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-amber-500" />
              Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Student</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Score</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Strength</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((student, index) => {
                    const topStrength = Object.entries(student.breakdownScores)
                      .sort(([,a], [,b]) => b - a)[0];
                    
                    return (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {getRankIcon(index + 1)}
                            <span className={`font-bold ${index < 3 ? 'text-lg' : ''}`}>
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{student.name}</div>
                              <div className="text-sm text-gray-500">
                                Grade {student.questionnaire.basicInfo.grade}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center px-3 py-2 rounded-xl text-white font-bold bg-gradient-to-r ${getScoreColor(student.totalScore)} shadow-md`}>
                            {student.totalScore}/100
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getScoreColor(student.totalScore)} text-white`}>
                            {getScoreLabel(student.totalScore)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">
                            <div className="font-medium">
                              {topStrength[0].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                            <div className="text-xs text-gray-500">{topStrength[1]} points</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            <Eye className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeInUp">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {selectedStudent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                    <p className="text-blue-100">
                      Grade {selectedStudent.questionnaire.basicInfo.grade} • {selectedStudent.questionnaire.basicInfo.schoolName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              
              {/* Score Display */}
              <div className="mt-6 flex items-center justify-between">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-white/80 text-sm mb-1">Total Score</div>
                  <div className="text-3xl font-bold">{selectedStudent.totalScore}/100</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-white/80 text-sm mb-1">Status</div>
                  <div className="text-xl font-bold">{getScoreLabel(selectedStudent.totalScore)}</div>
                </div>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[60vh] space-y-8">
              {/* Score Breakdown */}
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
                  Score Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedStudent.breakdownScores).map(([key, value]) => (
                    <div key={key} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className="text-2xl font-bold text-blue-600">{value}</span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                          style={{ width: `${(value / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-green-500" />
                  Student Information
                </h4>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Age</div>
                      <div className="font-semibold text-gray-800">{selectedStudent.questionnaire.basicInfo.age} years old</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Grade</div>
                      <div className="font-semibold text-gray-800">{selectedStudent.questionnaire.basicInfo.grade}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">School</div>
                      <div className="font-semibold text-gray-800">{selectedStudent.questionnaire.basicInfo.schoolName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Parent Occupation</div>
                      <div className="font-semibold text-gray-800">{selectedStudent.questionnaire.basicInfo.parentOccupation}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Future Aspirations */}
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-purple-500" />
                  Future Aspirations
                </h4>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Field of Interest</div>
                    <div className="font-medium text-gray-800 bg-white rounded-xl p-3">
                      {selectedStudent.questionnaire.interestAspiration.interestedField}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">What Education Means</div>
                    <div className="font-medium text-gray-800 bg-white rounded-xl p-3">
                      {selectedStudent.questionnaire.selfReflection.educationMeaning}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Future Goals</div>
                    <div className="font-medium text-gray-800 bg-white rounded-xl p-3">
                      {selectedStudent.questionnaire.selfReflection.futureGoal}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 