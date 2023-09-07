import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Permission } from './permission'

@Entity({
  name: 'roles'
})
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    length: 20,
    comment: '角色名'
  })
  name: string

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'rolePermissions'
  })
  permissions: Permission[]
}
