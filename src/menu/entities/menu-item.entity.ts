import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity("menu_items")
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "varchar", length: 2048 })
  url: string

  @Column({ type: "int", nullable: true })
  parentId: number | null

  @ManyToOne(() => MenuItem, (parent) => parent.children, { onDelete: "CASCADE" })
  @JoinColumn({ name: "parentId" })
  parent?: MenuItem | null

  @OneToMany(() => MenuItem, (child) => child.parent)
  children: MenuItem[]

  @Column({ type: "int", default: 0 })
  position: number

  @Column({ type: "boolean", default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}