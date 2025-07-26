"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Trophy, 
  Target, 
  Star, 
  Users, 
  TrendingUp, 
  Zap,
  Gift,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGamification } from "@/hooks/useGamification";
import { 
  AchievementCard, 
  LevelProgress, 
  QuickStats 
} from "@/components/gamification/achievement-system";
import { 
  GameNotificationContainer 
} from "@/components/gamification/game-notifications";
import { 
  AnimatedButton, 
  GameCard, 
  AnimatedCounter, 
  AnimatedProgressBar,
  PulseEffect
} from "@/components/gamification/animated-ui";

export function GamifiedDashboard({ 
  userRole = "vendor", 
  session, 
  status 
}: { 
  userRole?: string;
  session?: any;
  status?: string;
}) {
  const {
    gamificationData,
    loading,
    completeTask,
    earnXP,
    unlockAchievement,
    notifications
  } = useGamification(userRole, session, status);

  const [activeTab, setActiveTab] = useState("overview");

  if (loading || !gamificationData) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const { userStats, achievements, dailyTasks, weeklyGoals, leaderboard } = gamificationData;

  // Calculer les tâches complétées aujourd'hui
  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalTasks = dailyTasks.length;
  const tasksProgress = (completedTasks / totalTasks) * 100;

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <GameNotificationContainer
        notifications={notifications.notifications}
        onDismiss={notifications.dismissNotification}
      />

      {/* Header avec niveau et progression */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <LevelProgress stats={userStats} />
        <QuickStats stats={userStats} />
      </motion.div>

      {/* Onglets du dashboard gamifié */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Missions
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Succès
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Classement
          </TabsTrigger>
        </TabsList>

        {/* Onglet Aperçu */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tâches quotidiennes */}
            <GameCard hoverEffect="lift" glowColor="blue">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Missions du Jour                  <Badge className={`${tasksProgress === 100 ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                    {completedTasks}/{totalTasks}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatedProgressBar
                  value={tasksProgress}
                  color="blue"
                  showPercentage={false}
                />
                
                <div className="space-y-2">
                  {dailyTasks.slice(0, 3).map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 
                          className={`h-4 w-4 ${task.completed ? 'text-green-500' : 'text-gray-300'}`} 
                        />
                        <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </span>
                      </div>                      <Badge className="text-xs border border-gray-300 bg-gray-50 text-gray-700">
                        +{task.xpReward} XP
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </GameCard>

            {/* Objectifs hebdomadaires */}
            <GameCard hoverEffect="lift" glowColor="green">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Objectifs Hebdomadaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyGoals.slice(0, 2).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{goal.title}</span>
                      <Badge className="border border-gray-300 bg-gray-50 text-gray-700">+{goal.xpReward} XP</Badge>
                    </div>
                    <AnimatedProgressBar
                      value={goal.progress}
                      max={goal.target}
                      color="green"
                    />
                    <div className="text-xs text-muted-foreground">
                      <AnimatedCounter value={goal.progress} /> / {goal.target} {goal.type}
                    </div>
                  </div>
                ))}
              </CardContent>
            </GameCard>
          </div>

          {/* Actions rapides gamifiées */}
          <GameCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatedButton
                  onClick={() => earnXP(10, "consultation du dashboard")}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  successMessage="XP gagné!"
                >
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <span className="text-xs">Voir Succès</span>
                </AnimatedButton>

                <AnimatedButton
                  onClick={() => earnXP(25, "mise à jour du profil")}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  successMessage="Profil mis à jour!"
                >
                  <Users className="h-6 w-6 text-blue-500" />
                  <span className="text-xs">Profil</span>
                </AnimatedButton>

                <PulseEffect active={true} color="green">
                  <AnimatedButton
                    onClick={() => {
                      const incompleteTasks = dailyTasks.filter(t => !t.completed);
                      if (incompleteTasks.length > 0) {
                        completeTask(incompleteTasks[0].id);
                      }
                    }}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 w-full"
                    successMessage="Mission accomplie!"
                  >
                    <Target className="h-6 w-6 text-green-500" />
                    <span className="text-xs">Mission</span>
                  </AnimatedButton>
                </PulseEffect>

                <AnimatedButton
                  onClick={() => unlockAchievement("first-sale")}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  successMessage="Succès débloqué!"
                >
                  <Gift className="h-6 w-6 text-purple-500" />
                  <span className="text-xs">Bonus</span>
                </AnimatedButton>
              </div>
            </CardContent>
          </GameCard>
        </TabsContent>

        {/* Onglet Missions */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Missions quotidiennes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Missions Quotidiennes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dailyTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GameCard
                      className={`p-4 ${task.completed ? 'bg-green-50 border-green-200' : ''}`}
                      hoverEffect="lift"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 
                            className={`h-5 w-5 ${task.completed ? 'text-green-500' : 'text-gray-300'}`} 
                          />
                          <div>
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className="border border-gray-300 bg-gray-50 text-gray-700">+{task.xpReward} XP</Badge>
                          {!task.completed && (
                            <AnimatedButton
                              size="sm"
                              onClick={() => completeTask(task.id)}
                              successMessage="Mission accomplie!"
                            >
                              Terminer
                            </AnimatedButton>
                          )}
                        </div>
                      </div>
                    </GameCard>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Objectifs hebdomadaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objectifs Hebdomadaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GameCard className="p-4" hoverEffect="glow" glowColor="blue">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{goal.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {goal.description}
                            </p>
                          </div>                          <Badge className="ml-2 border border-gray-300 bg-gray-50 text-gray-700">
                            +{goal.xpReward} XP
                          </Badge>
                        </div>
                        
                        <AnimatedProgressBar
                          value={goal.progress}
                          max={goal.target}
                          color="blue"
                        />
                        
                        <div className="flex justify-between text-sm">
                          <span>
                            <AnimatedCounter value={goal.progress} /> / {goal.target}
                          </span>
                          <span className="text-muted-foreground">
                            {Math.round((goal.progress / goal.target) * 100)}% complété
                          </span>
                        </div>
                      </div>
                    </GameCard>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Succès */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AchievementCard achievement={achievement} />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Classement */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Classement des Vendeurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GameCard
                      className={`p-4 ${entry.name === "Vous" ? 'bg-blue-50 border-blue-200' : ''}`}
                      hoverEffect="lift"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                            ${entry.position === 1 ? 'bg-yellow-500' : 
                              entry.position === 2 ? 'bg-gray-400' : 
                              entry.position === 3 ? 'bg-amber-600' : 'bg-gray-500'}
                          `}>
                            {entry.position}
                          </div>
                          <div>
                            <h4 className="font-medium">{entry.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Niveau {entry.level} • <AnimatedCounter value={entry.xp} /> XP
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {entry.change === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {entry.change === "down" && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                          {entry.position <= 3 && (
                            <div className="text-2xl">
                              {entry.position === 1 ? "🥇" : entry.position === 2 ? "🥈" : "🥉"}
                            </div>
                          )}
                        </div>
                      </div>
                    </GameCard>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
