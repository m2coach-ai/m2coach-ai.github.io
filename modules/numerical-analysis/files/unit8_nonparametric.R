list.files()
install.packages("haven")
library(haven)
health <- read_sav("Health Data.sav")
dim(health)
head(health[, c("age", "occupation", "sbp", "dbp", "diabetes")])
health$diabetes[1:10]
health$diabetes_f   <- as_factor(health$diabetes)
health$occupation_f <- as_factor(health$occupation)

table(health$diabetes_f)
table(health$occupation_f)
shapiro.test(health$dbp[health$diabetes_f == "No"])
mean(health$age)
median(health$age)
age_counts <- table(health$age)
age_counts[age_counts == max(age_counts)]
hist(health$age, breaks = 15, col = "#9FD3CF",
     main = "Age of participants", xlab = "Age (years)")
tapply(health$dbp, health$diabetes_f, median)
boxplot(dbp ~ diabetes_f, data = health, col = c("#9FD3CF", "#E8EEEC"),
        main = "Diastolic BP by diabetes status",
        xlab = "Has diabetes?", ylab = "Diastolic BP (mmHg)")
wilcox.test(dbp ~ diabetes_f, data = health)
tapply(health$sbp, health$occupation_f, median)
boxplot(sbp ~ occupation_f, data = health, col = "#9FD3CF",
        main = "Systolic BP by occupation",
        xlab = "Occupation", ylab = "Systolic BP (mmHg)")
kruskal.test(sbp ~ occupation_f, data = health)
